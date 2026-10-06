"use client";

import {
  dataRelativa,
  ehRecorde,
  emAndamento,
  historico,
  hojeISO,
  sessaoDo,
  treinoDeHoje,
  treinosNaSemana,
  ultimaVez,
  volumeNaSemana,
  type Treino,
} from "@/lib/treino";

interface Props {
  treinos: Treino[];
  carregando: boolean;
  onComecar: (treinoId: string) => void;
  onEditar: (treinoId: string) => void;
  onNovo: () => void;
}

function totalDeSeries(treino: Treino): number {
  return treino.exercicios.reduce((soma, e) => soma + e.series, 0);
}

export function Inicio({ treinos, carregando, onComecar, onEditar, onNovo }: Props) {
  const hoje = hojeISO();
  const sugerido = treinoDeHoje(treinos, hoje);
  const linhas = historico(treinos);
  const naSemana = treinosNaSemana(treinos, hoje);
  const volumeSemana = volumeNaSemana(treinos, hoje);

  // Primeira carga: sem isto a tela afirma "você ainda não tem treinos" antes
  // de os treinos chegarem, que é justamente a hora em que ela não sabe.
  if (carregando && treinos.length === 0) {
    return (
      <main className="coluna">
        <div className="esqueleto alto" />
        <div className="esqueleto" />
        <div className="esqueleto" />
      </main>
    );
  }

  const feitasHoje = sugerido ? sessaoDo(sugerido, hoje)?.series.length ?? 0 : 0;

  return (
    <main className="coluna">
      <section className="cartao destaque">
        <p className="rotulo">Hoje</p>

        {treinos.length === 0 && (
          <>
            <h2>Comece pelo primeiro treino</h2>
            <p className="suave">Monte a lista de exercícios uma vez. Depois é só marcar as séries.</p>
            <button className="primario grande" onClick={onNovo}>
              Criar treino
            </button>
          </>
        )}

        {treinos.length > 0 && !sugerido && (
          <>
            <h2>Tudo feito por hoje</h2>
            <p className="suave">Todos os treinos já foram concluídos. Bom descanso.</p>
          </>
        )}

        {sugerido && (
          <>
            <h2>{sugerido.nome}</h2>
            <p className="suave">
              {sugerido.foco || `${sugerido.exercicios.length} exercícios`}
              {emAndamento(sugerido, hoje) && ` · ${feitasHoje} de ${totalDeSeries(sugerido)} séries feitas`}
            </p>
            {sugerido.exercicios.length === 0 ? (
              <>
                <p className="suave">Este treino ainda não tem exercícios.</p>
                <button className="primario grande" onClick={() => onEditar(sugerido.id)}>
                  Adicionar exercícios
                </button>
              </>
            ) : (
              <button className="primario grande" onClick={() => onComecar(sugerido.id)}>
                {emAndamento(sugerido, hoje) ? "Continuar treino" : "Começar treino"}
              </button>
            )}
          </>
        )}
      </section>

      {naSemana + volumeSemana > 0 && (
        <section className="cartao">
          <p className="rotulo">Últimos 7 dias</p>
          <div className="numeros">
            <div>
              <strong>{naSemana}</strong>
              <span className="suave">{naSemana === 1 ? "treino" : "treinos"}</span>
            </div>
            {/* Sem carga registrada o volume é sempre zero; aí ele não aparece. */}
            {volumeSemana > 0 && (
              <div>
                <strong>{volumeSemana.toLocaleString("pt-BR")}</strong>
                <span className="suave">kg levantados</span>
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <div className="linha-titulo">
          <h2>Meus treinos</h2>
          <button className="link" onClick={onNovo}>
            + Novo
          </button>
        </div>
        <ul className="lista">
          {treinos.map((treino) => {
            const ultima = ultimaVez(treino);
            const andamento = emAndamento(treino, hoje);
            return (
              <li key={treino.id} className="item">
                <button className="item-principal" onClick={() => onComecar(treino.id)}>
                  <strong>{treino.nome}</strong>
                  <p className="suave">
                    {treino.exercicios.length} exercícios ·{" "}
                    {andamento ? "em andamento" : ultima ? `última vez ${dataRelativa(ultima, hoje)}` : "nunca feito"}
                  </p>
                </button>
                <button className="icone" aria-label={`Editar ${treino.nome}`} onClick={() => onEditar(treino.id)}>
                  ✎
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2>Histórico</h2>
        {linhas.length === 0 && <p className="suave">As idas aparecem aqui depois da primeira série.</p>}
        <ul className="lista">
          {linhas.map((linha) => {
            const treino = treinos.find((t) => t.id === linha.treinoId);
            const sessao = treino ? sessaoDo(treino, linha.data) : undefined;
            return (
              <li key={linha.sessaoId} className="item">
                <div>
                  <strong>{linha.treino}</strong>
                  <p className="suave">
                    {dataRelativa(linha.data, hoje)} · {linha.feitas}/{linha.total} séries
                    {linha.volume > 0 && ` · ${linha.volume.toLocaleString("pt-BR")} kg`}
                    {!linha.concluida && " · em aberto"}
                    {treino && sessao && ehRecorde(treino, sessao) && " · recorde 🏆"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
