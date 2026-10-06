"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CATALOGO } from "@/lib/catalogoExercicios";
import { erroLegivel } from "@/lib/erros";
import { desfazerSerie, garantirSessao, marcarConclusao, registrarSerie } from "@/lib/repositorio";
import {
  dataRelativa,
  descreverSerie,
  duracaoEmMinutos,
  ehRecorde,
  hojeISO,
  seriesDo,
  sessaoDo,
  ultimaVezDoExercicio,
  valorPadrao,
  volumeDa,
  type Exercicio,
  type Serie,
  type Sessao as SessaoDoTreino,
  type Treino,
} from "@/lib/treino";

interface Props {
  treino: Treino;
  /** Muda a lista de treinos sem ir ao servidor: é o que faz a marcação responder na hora. */
  aplicar: (mudar: (treinos: Treino[]) => Treino[]) => void;
  onSair: () => void;
  onErro: (mensagem: string) => void;
}

const DESCANSOS = [45, 60, 90, 120];
const CHAVE_DESCANSO = "academia:descanso";
/** Linhas gravadas só no navegador, à espera da resposta do servidor. */
const PROVISORIA = "provisoria-";

/* ==========================================================================
   Mudanças na lista de treinos, aplicadas antes da resposta do servidor
   ========================================================================== */

function comSessao(
  treinos: Treino[],
  treinoId: string,
  data: string,
  mudar: (sessao: SessaoDoTreino) => SessaoDoTreino,
): Treino[] {
  return treinos.map((treino) => {
    if (treino.id !== treinoId) return treino;
    const atual = treino.sessoes.find((s) => s.data === data);
    const base: SessaoDoTreino = atual ?? {
      id: `${PROVISORIA}${data}`,
      data,
      iniciada_em: new Date().toISOString(),
      concluida_em: null,
      series: [],
    };
    return { ...treino, sessoes: [...treino.sessoes.filter((s) => s.data !== data), mudar(base)] };
  });
}

/* ==========================================================================
   Avisos: o celular fica no bolso entre as séries
   ========================================================================== */

function vibrar(padrao: number | number[]) {
  try {
    navigator.vibrate?.(padrao);
  } catch {
    // Vibração é enfeite: um navegador que não tem não pode derrubar o treino.
  }
}

function apitar() {
  try {
    const Contexto =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Contexto) return;
    const contexto = new Contexto();
    const oscilador = contexto.createOscillator();
    const ganho = contexto.createGain();
    oscilador.frequency.value = 880;
    ganho.gain.setValueAtTime(0.0001, contexto.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.25, contexto.currentTime + 0.02);
    ganho.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + 0.6);
    oscilador.connect(ganho).connect(contexto.destination);
    oscilador.start();
    oscilador.stop(contexto.currentTime + 0.6);
    oscilador.onended = () => void contexto.close();
  } catch {
    // Sem áudio (política do navegador, aba muda): a vibração e a tela já avisam.
  }
}

/** Segura a tela acesa enquanto o treino está aberto: ninguém quer destravar o celular a cada série. */
function useTelaAcesa() {
  useEffect(() => {
    const nav = navigator as Navigator & {
      wakeLock?: { request(tipo: "screen"): Promise<{ release(): Promise<void> }> };
    };
    if (!nav.wakeLock) return;

    let trava: { release(): Promise<void> } | null = null;
    let vivo = true;

    const pedir = async () => {
      try {
        const nova = await nav.wakeLock!.request("screen");
        if (vivo) trava = nova;
        else void nova.release();
      } catch {
        // Negada (aba em segundo plano, bateria baixa): o treino segue normalmente.
      }
    };

    // O navegador solta a trava quando a aba sai de foco; ao voltar, pede de novo.
    const aoVoltar = () => {
      if (document.visibilityState === "visible") void pedir();
    };

    void pedir();
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      vivo = false;
      document.removeEventListener("visibilitychange", aoVoltar);
      void trava?.release();
    };
  }, []);
}

/* ==========================================================================
   O contador com + e −: dá para usar com a mão suada, sem abrir o teclado
   ========================================================================== */

interface ContadorProps {
  rotulo: string;
  valor: number | null;
  passo: number;
  minimo: number;
  /** Na carga, vazio quer dizer peso do corpo. Nas repetições não existe vazio. */
  aceitaVazio?: boolean;
  textoVazio?: string;
  sufixo?: string;
  onMudar: (valor: number | null) => void;
}

function Contador({
  rotulo,
  valor,
  passo,
  minimo,
  aceitaVazio = false,
  textoVazio = "—",
  sufixo = "",
  onMudar,
}: ContadorProps) {
  const [digitando, setDigitando] = useState(false);
  const [texto, setTexto] = useState("");

  function abrir() {
    setTexto(valor === null ? "" : String(valor));
    setDigitando(true);
  }

  function fechar() {
    const numero = Number(texto.replace(",", "."));
    if (texto.trim() === "") onMudar(aceitaVazio ? null : minimo);
    else if (Number.isFinite(numero)) onMudar(Math.max(minimo, numero));
    setDigitando(false);
  }

  function somar(delta: number) {
    const proximo = Math.round(((valor ?? 0) + delta) * 100) / 100;
    if (proximo < minimo) onMudar(aceitaVazio ? null : minimo);
    else onMudar(proximo);
  }

  return (
    <div className="contador">
      <span className="contador-rotulo">{rotulo}</span>
      <div className="contador-linha">
        <button type="button" className="contador-botao" aria-label={`Diminuir ${rotulo}`} onClick={() => somar(-passo)}>
          −
        </button>
        {digitando ? (
          <input
            className="contador-entrada"
            type="text"
            inputMode="decimal"
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onBlur={fechar}
            onKeyDown={(e) => {
              if (e.key === "Enter") fechar();
            }}
          />
        ) : (
          <button type="button" className="contador-valor" onClick={abrir} aria-label={`Digitar ${rotulo}`}>
            {valor === null ? textoVazio : `${valor}${sufixo}`}
          </button>
        )}
        <button type="button" className="contador-botao" aria-label={`Aumentar ${rotulo}`} onClick={() => somar(passo)}>
          +
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   O treino em andamento
   ========================================================================== */

export function Sessao({ treino, aplicar, onSair, onErro }: Props) {
  const hoje = hojeISO();
  const sessao = sessaoDo(treino, hoje);

  const [pulados, setPulados] = useState<string[]>([]);
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(0);

  const [segundosDeDescanso, setSegundosDeDescanso] = useState(90);
  const [descansoAte, setDescansoAte] = useState<number | null>(null);
  const [agora, setAgora] = useState(() => Date.now());
  const avisou = useRef(false);
  const idDaSessaoEmCurso = useRef<Promise<string> | null>(null);

  useTelaAcesa();

  // A preferência só pode ser lida depois da montagem: no servidor não existe localStorage.
  useEffect(() => {
    try {
      const guardado = Number(localStorage.getItem(CHAVE_DESCANSO));
      if (guardado > 0) setSegundosDeDescanso(guardado);
    } catch {
      // Navegação privada ou armazenamento bloqueado: fica o padrão.
    }
  }, []);

  useEffect(() => {
    if (descansoAte === null) return;
    const id = setInterval(() => setAgora(Date.now()), 200);
    return () => clearInterval(id);
  }, [descansoAte]);

  const restante = descansoAte === null ? 0 : Math.max(0, Math.ceil((descansoAte - agora) / 1000));

  useEffect(() => {
    if (descansoAte === null || restante > 0 || avisou.current) return;
    avisou.current = true;
    apitar();
    vibrar([120, 60, 120]);
  }, [descansoAte, restante]);

  /* ---------------------------------------------------------------- o que fazer agora */

  const proximoPendente = (): Exercicio | null => {
    const pendentes = treino.exercicios.filter((e) => seriesDo(sessao, e.id).length < e.series);
    return pendentes.find((e) => !pulados.includes(e.id)) ?? pendentes[0] ?? null;
  };

  const proximo = proximoPendente();
  const exercicio: Exercicio | null =
    treino.exercicios.find((e) => e.id === escolhido) ?? proximo ?? treino.exercicios[0] ?? null;

  const catalogo = exercicio?.ref ? CATALOGO.find((c) => c.id === exercicio.ref) : undefined;
  const feitas = exercicio ? seriesDo(sessao, exercicio.id) : [];
  const anterior = exercicio ? ultimaVezDoExercicio(treino, exercicio.id, hoje) : null;
  const padrao = exercicio ? valorPadrao(treino, exercicio, sessao) : { reps: 10, carga: null };

  const [carga, setCarga] = useState<number | null>(padrao.carga);

  // As repetições são as do plano do exercício e não se escolhem na hora; o que
  // muda de uma série para a outra é a carga.
  const repsDoPlano = exercicio?.reps ?? 0;

  // Trocou de exercício, ou mais uma série entrou: a sugestão de carga acompanha.
  useEffect(() => {
    setCarga(padrao.carga);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercicio?.id, feitas.length]);

  const totalSeries = treino.exercicios.reduce((soma, e) => soma + e.series, 0);
  const totalFeitas = treino.exercicios.reduce((soma, e) => soma + seriesDo(sessao, e.id).length, 0);
  const faltam = Math.max(0, totalSeries - totalFeitas);
  const concluida = Boolean(sessao?.concluida_em);
  const porcentagem = totalSeries === 0 ? 0 : Math.round((totalFeitas / totalSeries) * 100);

  /* ---------------------------------------------------------------- descanso */

  function comecarDescanso() {
    avisou.current = false;
    setAgora(Date.now());
    setDescansoAte(Date.now() + segundosDeDescanso * 1000);
  }

  function pararDescanso() {
    setDescansoAte(null);
  }

  function esticarDescanso(segundos: number) {
    avisou.current = false;
    setDescansoAte((ate) => Math.max(ate ?? Date.now(), Date.now()) + segundos * 1000);
  }

  function escolherDescanso(segundos: number) {
    setSegundosDeDescanso(segundos);
    try {
      localStorage.setItem(CHAVE_DESCANSO, String(segundos));
    } catch {
      // Sem armazenamento: vale só para este treino.
    }
  }

  /* ---------------------------------------------------------------- gravação */

  /**
   * O id da sessão de hoje, criando-a na primeira série.
   *
   * A promessa fica guardada porque duas séries marcadas em sequência rápida
   * chamariam `garantirSessao` duas vezes, e a segunda esbarraria na chave
   * única de (treino, dia).
   */
  const idDaSessao = useCallback(async (): Promise<string> => {
    const atual = sessaoDo(treino, hoje);
    if (atual && !atual.id.startsWith(PROVISORIA)) return atual.id;

    idDaSessaoEmCurso.current ??= garantirSessao(treino.id, hoje)
      .then((nova) => {
        aplicar((treinos) =>
          comSessao(treinos, treino.id, hoje, (s) => ({ ...s, id: nova.id, iniciada_em: nova.iniciada_em })),
        );
        return nova.id;
      })
      .catch((falha) => {
        idDaSessaoEmCurso.current = null;
        throw falha;
      });

    return idDaSessaoEmCurso.current;
  }, [treino, hoje, aplicar]);

  async function marcarSerie() {
    if (!exercicio || feitas.length >= exercicio.series) return;

    const repsFinal = Math.max(0, Math.min(1000, Math.round(exercicio.reps)));
    const cargaFinal = carga === null || !Number.isFinite(carga) ? null : Math.max(0, carga);
    const numero = feitas.length + 1;
    const provisoria: Serie = {
      id: `${PROVISORIA}${Date.now()}`,
      exercicio_id: exercicio.id,
      numero,
      reps: repsFinal,
      carga_kg: cargaFinal,
    };

    // A série aparece na tela antes de o servidor responder: quem está treinando
    // não espera a rede para ver que a série contou.
    aplicar((treinos) =>
      comSessao(treinos, treino.id, hoje, (s) => ({ ...s, concluida_em: null, series: [...s.series, provisoria] })),
    );
    vibrar(25);
    comecarDescanso();
    setSalvando((n) => n + 1);

    try {
      const sessaoId = await idDaSessao();
      const real = await registrarSerie(sessaoId, exercicio.id, numero, repsFinal, cargaFinal);
      aplicar((treinos) =>
        comSessao(treinos, treino.id, hoje, (s) => ({
          ...s,
          series: s.series.map((serie) => (serie.id === provisoria.id ? real : serie)),
        })),
      );
    } catch (falha) {
      aplicar((treinos) =>
        comSessao(treinos, treino.id, hoje, (s) => ({
          ...s,
          series: s.series.filter((serie) => serie.id !== provisoria.id),
        })),
      );
      pararDescanso();
      onErro(erroLegivel(falha, "Não foi possível salvar a série."));
    } finally {
      setSalvando((n) => Math.max(0, n - 1));
    }
  }

  async function desfazer() {
    const ultima = feitas[feitas.length - 1];
    // Uma série ainda sem resposta do servidor não tem id para apagar.
    if (!ultima || ultima.id.startsWith(PROVISORIA)) return;

    aplicar((treinos) =>
      comSessao(treinos, treino.id, hoje, (s) => ({
        ...s,
        series: s.series.filter((serie) => serie.id !== ultima.id),
      })),
    );
    pararDescanso();

    try {
      await desfazerSerie(ultima.id);
    } catch (falha) {
      aplicar((treinos) => comSessao(treinos, treino.id, hoje, (s) => ({ ...s, series: [...s.series, ultima] })));
      onErro(erroLegivel(falha, "Não foi possível desfazer a série."));
    }
  }

  async function concluir(valor: boolean) {
    const atual = sessaoDo(treino, hoje);
    if (!atual) return;
    if (valor && faltam > 0 && !confirm(`Ainda faltam ${faltam} séries. Concluir o treino assim mesmo?`)) return;

    const antes = atual.concluida_em;
    const depois = valor ? new Date().toISOString() : null;
    aplicar((treinos) => comSessao(treinos, treino.id, hoje, (s) => ({ ...s, concluida_em: depois })));
    pararDescanso();
    if (valor) vibrar([60, 40, 60, 40, 120]);

    try {
      const sessaoId = await idDaSessao();
      await marcarConclusao(sessaoId, valor);
    } catch (falha) {
      aplicar((treinos) => comSessao(treinos, treino.id, hoje, (s) => ({ ...s, concluida_em: antes })));
      onErro(erroLegivel(falha, "Não foi possível concluir o treino."));
    }
  }

  function pular() {
    if (!exercicio) return;
    setPulados((atual) => [...new Set([...atual, exercicio.id])]);
    setEscolhido(null);
    pararDescanso();
  }

  /* ---------------------------------------------------------------- telas */

  if (concluida && sessao) {
    const volume = volumeDa(sessao);
    const minutos = duracaoEmMinutos(sessao);
    const recorde = ehRecorde(treino, sessao);
    return (
      <main className="coluna">
        <section className="cartao destaque centralizado">
          <p className="rotulo">Treino concluído</p>
          <h2>{treino.nome}</h2>
          {recorde && <p className="medalha">🏆 Recorde de volume para este treino</p>}
          <div className="numeros">
            <div>
              <strong>{totalFeitas}</strong>
              <span className="suave">de {totalSeries} séries</span>
            </div>
            <div>
              <strong>{volume.toLocaleString("pt-BR")}</strong>
              <span className="suave">kg no total</span>
            </div>
            {minutos !== null && (
              <div>
                <strong>{minutos}</strong>
                <span className="suave">minutos</span>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3>O que você fez</h3>
          <ul className="lista">
            {treino.exercicios.map((e) => {
              const series = seriesDo(sessao, e.id);
              return (
                <li key={e.id} className="item">
                  <div>
                    <strong>{e.nome}</strong>
                    <p className="suave">
                      {series.length === 0 ? "não feito" : series.map(descreverSerie).join(" · ")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <button className="primario grande" onClick={onSair}>
          Voltar para o início
        </button>
        <button className="secundario" onClick={() => void concluir(false)}>
          Reabrir treino
        </button>
      </main>
    );
  }

  return (
    <main className="coluna sessao">
      <div className="barra-sessao">
        <button className="link" onClick={onSair}>
          ← Sair
        </button>
        <span className="suave">
          {totalFeitas}/{totalSeries} séries{salvando > 0 ? " · salvando…" : ""}
        </span>
        {/* O treino acaba quando ela decide, não quando a lista termina: o botão
            fica aqui em cima para não depender de rolar a tela até o fim. */}
        {totalFeitas > 0 && (
          <button className="link" onClick={() => void concluir(true)}>
            Concluir
          </button>
        )}
      </div>

      <div className="progresso" role="progressbar" aria-valuenow={porcentagem} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${porcentagem}%` }} />
      </div>

      <h2>{treino.nome}</h2>

      {!exercicio && <p className="suave">Este treino não tem exercícios. Volte e adicione pelo menu Editar.</p>}

      {exercicio && (
        <section className="cartao destaque">
          <div className="linha-titulo">
            <p className="rotulo">{exercicio.id === proximo?.id ? "Agora" : "Escolhido"}</p>
            {pulados.includes(exercicio.id) && <span className="etiqueta">pulado</span>}
          </div>
          <h3>{exercicio.nome}</h3>

          {catalogo && (
            <>
              <div className="fotos">
                <figure>
                  <img src={`/exercicios/${catalogo.id}/0.jpg`} alt={`${catalogo.nome}: começo do movimento`} loading="lazy" />
                  <figcaption>Começo</figcaption>
                </figure>
                <figure>
                  <img src={`/exercicios/${catalogo.id}/1.jpg`} alt={`${catalogo.nome}: fim do movimento`} loading="lazy" />
                  <figcaption>Fim</figcaption>
                </figure>
              </div>
              <details>
                <summary>Como fazer</summary>
                <ol className="passos">
                  {catalogo.como.map((passo) => (
                    <li key={passo}>{passo}</li>
                  ))}
                </ol>
                <p className="suave">{catalogo.dica}</p>
              </details>
            </>
          )}

          <p className="suave">
            Série {Math.min(feitas.length + 1, exercicio.series)} de {exercicio.series} · {exercicio.reps} repetições
          </p>

          {anterior && (
            <p className="suave referencia">
              Última vez ({dataRelativa(anterior.data, hoje)}): {anterior.series.map(descreverSerie).join(" · ")}
            </p>
          )}

          <div className="marcas" aria-label={`${feitas.length} de ${exercicio.series} séries feitas`}>
            {Array.from({ length: exercicio.series }, (_, i) => (
              <span key={i} className={i < feitas.length ? "marca feita" : "marca"}>
                {i < feitas.length ? "✓" : i + 1}
              </span>
            ))}
          </div>

          {feitas.length > 0 && (
            <p className="suave">Hoje: {feitas.map(descreverSerie).join(" · ")}</p>
          )}

          {feitas.length < exercicio.series ? (
            <>
              <div className="contadores">
                <Contador
                  rotulo="Carga"
                  valor={carga}
                  passo={2.5}
                  minimo={0}
                  aceitaVazio
                  textoVazio="a escolher"
                  sufixo=" kg"
                  onMudar={setCarga}
                />
              </div>
              <button className="primario grande" onClick={() => void marcarSerie()}>
                Marcar série {feitas.length + 1} · {repsDoPlano} reps ×{" "}
                {carga === null ? "sem carga" : `${carga} kg`}
              </button>
            </>
          ) : (
            <p className="pronto-texto">✓ Exercício completo</p>
          )}

          <div className="acoes-exercicio">
            {feitas.length > 0 && (
              <button className="secundario" onClick={() => void desfazer()}>
                Desfazer série
              </button>
            )}
            {proximo && proximo.id !== exercicio.id && (
              <button className="secundario" onClick={() => setEscolhido(null)}>
                Ir para o atual
              </button>
            )}
            {feitas.length < exercicio.series && !pulados.includes(exercicio.id) && (
              <button className="secundario" onClick={pular}>
                Pular exercício
              </button>
            )}
          </div>
        </section>
      )}

      <section>
        <h3>Ordem do treino</h3>
        <ul className="lista">
          {treino.exercicios.map((e) => {
            const n = seriesDo(sessao, e.id).length;
            const pronto = n >= e.series;
            const atual = e.id === exercicio?.id;
            return (
              <li key={e.id}>
                <button
                  className={`item botao-item ${pronto ? "pronto" : ""} ${atual ? "atual" : ""}`}
                  onClick={() => setEscolhido(e.id)}
                >
                  <span>
                    {pronto ? "✓ " : ""}
                    {e.nome}
                    {pulados.includes(e.id) && !pronto && <span className="etiqueta">pulado</span>}
                  </span>
                  <span className="suave">
                    {n}/{e.series}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="cartao">
        <p className="rotulo">Descanso entre séries</p>
        <div className="opcoes">
          {DESCANSOS.map((segundos) => (
            <button
              key={segundos}
              className={`opcao ${segundos === segundosDeDescanso ? "ativa" : ""}`}
              onClick={() => escolherDescanso(segundos)}
            >
              {segundos}s
            </button>
          ))}
        </div>
        <p className="suave">O cronômetro começa sozinho a cada série marcada.</p>
      </section>

      {descansoAte !== null && (
        <div className="descanso" role="status">
          <div className="descanso-info">
            <strong className={restante === 0 ? "acabou" : ""}>
              {restante === 0 ? "Pode ir!" : `${Math.floor(restante / 60)}:${String(restante % 60).padStart(2, "0")}`}
            </strong>
            <span className="suave">descanso</span>
          </div>
          <button className="secundario" onClick={() => esticarDescanso(30)}>
            +30s
          </button>
          <button className="primario" onClick={pararDescanso}>
            {restante === 0 ? "Fechar" : "Pular"}
          </button>
        </div>
      )}
    </main>
  );
}
