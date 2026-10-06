"use client";

import { useMemo, useRef, useState } from "react";
import { excluirTreino, salvarTreino, type ExercicioEditavel } from "@/lib/repositorio";
import { erroLegivel } from "@/lib/erros";
import type { Treino } from "@/lib/treino";
import { CATALOGO, type Grupo } from "@/lib/catalogoExercicios";

const GRUPOS: Record<Grupo, string> = {
  peito: "Peito",
  costas: "Costas",
  ombros: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  quadriceps: "Quadríceps",
  posteriores: "Posteriores",
  gluteos: "Glúteos",
  panturrilha: "Panturrilha",
  abdomen: "Abdômen",
  cardio: "Cardio",
};

interface Props {
  treino: Treino;
  onVoltar: () => void;
  onErro: (mensagem: string) => void;
}

const SERIES_MAX = 10;
const NOME_MAX = 40;

function paraEdicao(treino: Treino): ExercicioEditavel[] {
  return treino.exercicios.map((e) => ({
    id: e.id,
    nome: e.nome,
    series: e.series,
    reps: e.reps,
    carga_kg: e.carga_kg,
    ref: e.ref,
  }));
}

/** Edita um treino: nome, foco e a lista de exercícios. Grava tudo de uma vez ao salvar. */
export function EditorTreino({ treino, onVoltar, onErro }: Props) {
  const [nome, setNome] = useState(treino.nome);
  const [foco, setFoco] = useState(treino.foco);
  const [exercicios, setExercicios] = useState<ExercicioEditavel[]>(() => paraEdicao(treino));
  const [removidos, setRemovidos] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  // O estado de quando a tela abriu, para saber se há mudança por salvar.
  const original = useRef(JSON.stringify({ nome: treino.nome, foco: treino.foco, exercicios: paraEdicao(treino) }));
  const alterado = JSON.stringify({ nome, foco, exercicios }) !== original.current;

  const porGrupo = useMemo(
    () =>
      (Object.keys(GRUPOS) as Grupo[]).map((grupo) => ({
        grupo,
        itens: CATALOGO.filter((c) => c.grupo === grupo).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
      })),
    [],
  );

  function mudar(indice: number, campo: Partial<ExercicioEditavel>) {
    setExercicios((atual) => atual.map((e, i) => (i === indice ? { ...e, ...campo } : e)));
  }

  function mover(indice: number, direcao: -1 | 1) {
    setExercicios((atual) => {
      const destino = indice + direcao;
      if (destino < 0 || destino >= atual.length) return atual;
      const lista = [...atual];
      [lista[indice], lista[destino]] = [lista[destino], lista[indice]];
      return lista;
    });
  }

  function remover(indice: number) {
    const alvo = exercicios[indice];
    if (alvo.id && !confirm(`Remover "${alvo.nome}"? As séries já registradas dele também saem do histórico.`)) return;
    if (alvo.id) setRemovidos((atual) => [...atual, alvo.id as string]);
    setExercicios((atual) => atual.filter((_, i) => i !== indice));
  }

  async function salvar() {
    const limpos = exercicios.map((e) => ({ ...e, nome: e.nome.trim() })).filter((e) => e.nome.length > 0);

    setSalvando(true);
    try {
      await salvarTreino(treino.id, nome.trim().slice(0, NOME_MAX) || "Sem nome", foco.trim(), limpos, removidos);
      original.current = JSON.stringify({ nome, foco, exercicios });
      onVoltar();
    } catch (falha) {
      onErro(erroLegivel(falha, "Não foi possível salvar o treino."));
      setSalvando(false);
    }
  }

  function sair() {
    if (alterado && !confirm("Você mudou o treino e ainda não salvou. Sair assim mesmo?")) return;
    onVoltar();
  }

  async function apagar() {
    if (!confirm(`Apagar o treino "${treino.nome}" e todo o histórico dele?`)) return;
    try {
      await excluirTreino(treino.id);
      onVoltar();
    } catch (falha) {
      onErro(erroLegivel(falha, "Não foi possível apagar o treino."));
    }
  }

  return (
    <main className="coluna com-barra">
      <div className="linha-titulo">
        <button className="link" onClick={sair}>
          ← Voltar
        </button>
        <button className="link perigo" onClick={() => void apagar()}>
          Apagar treino
        </button>
      </div>

      <section className="cartao">
        <label>
          Nome
          <input value={nome} maxLength={NOME_MAX} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label>
          Foco
          <input
            value={foco}
            placeholder="Ex.: Peito e tríceps"
            maxLength={60}
            onChange={(e) => setFoco(e.target.value)}
          />
        </label>
      </section>

      <section className="coluna">
        <h2>Exercícios</h2>
        {exercicios.length === 0 && <p className="suave">Nenhum exercício ainda. Use o botão abaixo.</p>}

        {exercicios.map((ex, i) => {
          const doCatalogo = ex.ref ? CATALOGO.find((c) => c.id === ex.ref) : undefined;
          return (
            <div key={ex.id ?? `novo-${i}`} className="cartao exercicio">
              <div className="linha-titulo">
                <span className="numero-exercicio">{i + 1}</span>
                <div className="acoes">
                  <button className="icone" aria-label="Subir" onClick={() => mover(i, -1)} disabled={i === 0}>
                    ↑
                  </button>
                  <button
                    className="icone"
                    aria-label="Descer"
                    onClick={() => mover(i, 1)}
                    disabled={i === exercicios.length - 1}
                  >
                    ↓
                  </button>
                  <button className="icone perigo" aria-label="Remover" onClick={() => remover(i)}>
                    ×
                  </button>
                </div>
              </div>

              <div className="escolha">
                {doCatalogo && (
                  <img
                    className="miniatura"
                    src={`/exercicios/${doCatalogo.id}/1.jpg`}
                    alt=""
                    loading="lazy"
                  />
                )}
                <label>
                  Exercício do catálogo (traz as fotos e o passo a passo)
                  <select
                    value={ex.ref ?? ""}
                    onChange={(e) => {
                      const escolhido = CATALOGO.find((c) => c.id === e.target.value);
                      if (escolhido) mudar(i, { ref: escolhido.id, nome: escolhido.nome });
                      else mudar(i, { ref: null });
                    }}
                  >
                    <option value="">Sem catálogo (escrever à mão)</option>
                    {porGrupo.map(({ grupo, itens }) => (
                      <optgroup key={grupo} label={GRUPOS[grupo]}>
                        {itens.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nome}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Nome que aparece no treino
                <input
                  placeholder="Nome do exercício"
                  value={ex.nome}
                  maxLength={60}
                  onChange={(e) => mudar(i, { nome: e.target.value })}
                />
              </label>

              <div className="grade">
                <label>
                  Séries
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={SERIES_MAX}
                    value={ex.series}
                    onChange={(e) =>
                      mudar(i, { series: Math.min(SERIES_MAX, Math.max(1, Number(e.target.value) || 1)) })
                    }
                  />
                </label>
                <label>
                  Repetições
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={100}
                    value={ex.reps}
                    onChange={(e) => mudar(i, { reps: Math.min(100, Math.max(1, Number(e.target.value) || 1)) })}
                  />
                </label>
                <label>
                  Carga (kg)
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.5"
                    placeholder="—"
                    value={ex.carga_kg ?? ""}
                    onChange={(e) =>
                      mudar(i, { carga_kg: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) })
                    }
                  />
                </label>
              </div>
            </div>
          );
        })}

        <button
          className="secundario"
          onClick={() =>
            setExercicios((atual) => [...atual, { id: null, nome: "", series: 3, reps: 10, carga_kg: null, ref: null }])
          }
        >
          + Adicionar exercício
        </button>
      </section>

      <div className="barra-inferior">
        <button className="primario grande" onClick={() => void salvar()} disabled={salvando || !alterado}>
          {salvando ? "Salvando…" : alterado ? "Salvar treino" : "Tudo salvo"}
        </button>
      </div>
    </main>
  );
}
