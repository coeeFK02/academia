"use client";

import {
  emAndamento,
  hojeISO,
  sessaoDo,
  treinoDeHoje,
  treinosNaSemana,
  volumeNaSemana,
  type Treino,
} from "@/lib/treino";

interface Props {
  treinos: Treino[];
  carregando: boolean;
  onComecar: (treinoId: string) => void;
}

function totalDeSeries(treino: Treino): number {
  return treino.exercicios.reduce((soma, e) => soma + e.series, 0);
}

/**
 * A tela inicial tem uma pergunta só: o que treinar agora.
 *
 * Os treinos são cadastrados fora do app (ver `supabase/treinos-exemplo.sql`),
 * então aqui não há lista para administrar nem histórico para folhear.
 */
export function Inicio({ treinos, carregando, onComecar }: Props) {
  const hoje = hojeISO();
  const sugerido = treinoDeHoje(treinos, hoje);
  const naSemana = treinosNaSemana(treinos, hoje);
  const volumeSemana = volumeNaSemana(treinos, hoje);

  // Primeira carga: sem isto a tela afirma que não há treino antes de os treinos
  // chegarem, que é justamente a hora em que ela não sabe.
  if (carregando && treinos.length === 0) {
    return (
      <main className="coluna">
        <div className="esqueleto alto" />
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
            <h2>Nenhum treino cadastrado</h2>
            <p className="suave">Assim que os treinos entrarem no banco, eles aparecem aqui.</p>
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
              <p className="suave">Este treino está sem exercícios.</p>
            ) : (
              <button className="primario grande" onClick={() => onComecar(sugerido.id)}>
                {emAndamento(sugerido, hoje) ? "Continuar treino" : "Começar treino"}
              </button>
            )}
          </>
        )}
      </section>

      {(naSemana > 0 || volumeSemana > 0) && (
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
    </main>
  );
}
