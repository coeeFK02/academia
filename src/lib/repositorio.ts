import { supabase } from "./supabase";
import type { Exercicio, Serie, Sessao, Treino } from "./treino";

/**
 * Tudo que lê e escreve no Supabase. Os componentes só chamam daqui.
 *
 * `user_id` não é enviado nos inserts: a coluna tem `default auth.uid()`, e a
 * RLS recusa qualquer linha que não seja de quem está logado.
 */

function db() {
  if (!supabase) throw new Error("Supabase não configurado. Veja o .env.example.");
  return supabase;
}

/** O formato exato que o PostgREST devolve para o select aninhado. */
interface LinhaDeTreino {
  id: string;
  nome: string;
  foco: string;
  ordem: number;
  academia_exercicios: Exercicio[];
  academia_sessoes: (Omit<Sessao, "series"> & { academia_series: Serie[] })[];
}

export async function carregarTreinos(): Promise<Treino[]> {
  const { data, error } = await db()
    .from("academia_treinos")
    .select(
      "id,nome,foco,ordem," +
        "academia_exercicios(id,nome,series,reps,carga_kg,ordem,ref)," +
        "academia_sessoes(id,data,iniciada_em,concluida_em,academia_series(id,exercicio_id,numero,reps,carga_kg))",
    )
    .order("ordem")
    .order("created_at");
  if (error) throw error;

  // Sem tipos gerados do banco, o cliente não consegue inferir o select aninhado.
  return ((data ?? []) as unknown as LinhaDeTreino[]).map((linha) => ({
    id: linha.id,
    nome: linha.nome,
    foco: linha.foco,
    ordem: linha.ordem,
    exercicios: [...linha.academia_exercicios].sort((a, b) => a.ordem - b.ordem),
    sessoes: linha.academia_sessoes.map((s) => ({
      id: s.id,
      data: s.data,
      iniciada_em: s.iniciada_em,
      concluida_em: s.concluida_em,
      series: s.academia_series,
    })),
  }));
}

export async function criarTreino(ordem: number): Promise<string> {
  const { data, error } = await db()
    .from("academia_treinos")
    .insert({ nome: "Novo treino", foco: "", ordem })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

/** Um exercício em edição. `id` null é um exercício novo, ainda não gravado. */
export interface ExercicioEditavel {
  id: string | null;
  nome: string;
  series: number;
  reps: number;
  carga_kg: number | null;
  ref: string | null;
}

/** Grava o treino inteiro de uma vez: nome, foco, exercícios novos, editados, removidos e a ordem. */
export async function salvarTreino(
  treinoId: string,
  nome: string,
  foco: string,
  exercicios: ExercicioEditavel[],
  removidos: string[],
): Promise<void> {
  const cliente = db();

  const { error: erroTreino } = await cliente.from("academia_treinos").update({ nome, foco }).eq("id", treinoId);
  if (erroTreino) throw erroTreino;

  if (removidos.length > 0) {
    const { error } = await cliente.from("academia_exercicios").delete().in("id", removidos);
    if (error) throw error;
  }

  for (const [ordem, ex] of exercicios.entries()) {
    const campos = { nome: ex.nome, series: ex.series, reps: ex.reps, carga_kg: ex.carga_kg, ref: ex.ref, ordem };
    const { error } = ex.id
      ? await cliente.from("academia_exercicios").update(campos).eq("id", ex.id)
      : await cliente.from("academia_exercicios").insert({ ...campos, treino_id: treinoId });
    if (error) throw error;
  }
}

export async function excluirTreino(treinoId: string): Promise<void> {
  const { error } = await db().from("academia_treinos").delete().eq("id", treinoId);
  if (error) throw error;
}

/** A sessão de um treino num dia. Cria só quando a primeira série é marcada. */
export async function garantirSessao(treinoId: string, data: string): Promise<Sessao> {
  const cliente = db();
  const campos = "id,data,iniciada_em,concluida_em";
  const { data: existente, error: erroBusca } = await cliente
    .from("academia_sessoes")
    .select(campos)
    .eq("treino_id", treinoId)
    .eq("data", data)
    .maybeSingle();
  if (erroBusca) throw erroBusca;
  if (existente) return { ...(existente as unknown as Omit<Sessao, "series">), series: [] };

  const { data: nova, error } = await cliente
    .from("academia_sessoes")
    .insert({ treino_id: treinoId, data })
    .select(campos)
    .single();
  if (error) throw error;
  return { ...(nova as unknown as Omit<Sessao, "series">), series: [] };
}

/** Grava a série e devolve a linha criada, para a tela trocar a versão provisória pela real. */
export async function registrarSerie(
  sessaoId: string,
  exercicioId: string,
  numero: number,
  reps: number,
  cargaKg: number | null,
): Promise<Serie> {
  const { data, error } = await db()
    .from("academia_series")
    .insert({ sessao_id: sessaoId, exercicio_id: exercicioId, numero, reps, carga_kg: cargaKg })
    .select("id,exercicio_id,numero,reps,carga_kg")
    .single();
  if (error) throw error;
  return data as unknown as Serie;
}

export async function desfazerSerie(serieId: string): Promise<void> {
  const { error } = await db().from("academia_series").delete().eq("id", serieId);
  if (error) throw error;
}

export async function marcarConclusao(sessaoId: string, concluida: boolean): Promise<void> {
  const { error } = await db()
    .from("academia_sessoes")
    .update({ concluida_em: concluida ? new Date().toISOString() : null })
    .eq("id", sessaoId);
  if (error) throw error;
}
