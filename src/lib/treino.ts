/**
 * Regras do treino: séries, volume, o que treinar hoje e o histórico.
 *
 * Tudo aqui é puro — recebe os dados já carregados e devolve números ou
 * listas. Não fala com o banco.
 */

export interface Exercicio {
  id: string;
  nome: string;
  /** Séries planejadas. */
  series: number;
  /** Repetições planejadas por série. */
  reps: number;
  /** Carga planejada, em kg. Ponto de partida, não o que foi feito. */
  carga_kg: number | null;
  ordem: number;
  /** Id do exercício no catálogo: de onde vêm as fotos e o passo a passo. Null se foi escrito à mão. */
  ref: string | null;
}

export interface Serie {
  id: string;
  exercicio_id: string;
  numero: number;
  reps: number;
  carga_kg: number | null;
}

export interface Sessao {
  id: string;
  /** O dia, YYYY-MM-DD. */
  data: string;
  iniciada_em: string;
  concluida_em: string | null;
  series: Serie[];
}

export interface Treino {
  id: string;
  nome: string;
  foco: string;
  ordem: number;
  exercicios: Exercicio[];
  sessoes: Sessao[];
}

/** A data de hoje no fuso local, YYYY-MM-DD. `toISOString` usaria UTC e erraria a noite. */
export function hojeISO(agora = new Date()): string {
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`;
}

export function sessaoDo(treino: Treino, data: string): Sessao | undefined {
  return treino.sessoes.find((s) => s.data === data);
}

/** As séries de um exercício numa sessão, na ordem em que foram feitas. */
export function seriesDo(sessao: Sessao | undefined, exercicioId: string): Serie[] {
  return (sessao?.series ?? [])
    .filter((s) => s.exercicio_id === exercicioId)
    .sort((a, b) => a.numero - b.numero);
}

/** Quilos levantados na sessão: soma de carga × repetições. Séries sem carga (peso do corpo) não entram. */
export function volumeDa(sessao: Sessao | undefined): number {
  if (!sessao) return 0;
  return Math.round(sessao.series.reduce((soma, s) => soma + (s.carga_kg ?? 0) * s.reps, 0));
}

/** O primeiro exercício que ainda tem série sobrando. Null quando tudo foi feito. */
export function proximoExercicio(treino: Treino, sessao: Sessao | undefined): Exercicio | null {
  return treino.exercicios.find((e) => seriesDo(sessao, e.id).length < e.series) ?? null;
}

/** A sessão de hoje existe e ainda não foi concluída. */
export function emAndamento(treino: Treino, hoje: string): boolean {
  const sessao = sessaoDo(treino, hoje);
  return Boolean(sessao && !sessao.concluida_em);
}

/** A data da última sessão concluída, ou "" se nunca foi concluído. */
export function ultimaVez(treino: Treino): string {
  return treino.sessoes
    .filter((s) => s.concluida_em)
    .reduce((maior, s) => (s.data > maior ? s.data : maior), "");
}

/**
 * O treino que o app sugere hoje.
 *
 * Um que já está em andamento ganha de tudo. Fora isso, é o que está parado há
 * mais tempo (nunca feito vem primeiro). Treinos já concluídos hoje saem da lista.
 */
export function treinoDeHoje(treinos: Treino[], hoje: string): Treino | null {
  const andamento = treinos.find((t) => emAndamento(t, hoje));
  if (andamento) return andamento;

  const livres = treinos.filter((t) => !sessaoDo(t, hoje)?.concluida_em);
  if (livres.length === 0) return null;
  return livres.reduce((antigo, atual) => (ultimaVez(atual) < ultimaVez(antigo) ? atual : antigo));
}

/** A sessão concluída bateu o volume de todas as anteriores do mesmo treino? */
export function ehRecorde(treino: Treino, sessao: Sessao): boolean {
  if (!sessao.concluida_em) return false;
  const volume = volumeDa(sessao);
  const anteriores = treino.sessoes
    .filter((s) => s.concluida_em && s.data < sessao.data)
    .map((s) => volumeDa(s));
  return volume > 0 && anteriores.length > 0 && volume > Math.max(...anteriores);
}

/**
 * Carga e repetições sugeridas para a próxima série: o que foi feito na última
 * vez que esse exercício apareceu, ou o planejado se nunca foi feito.
 */
export function valorPadrao(
  treino: Treino,
  exercicio: Exercicio,
  sessaoAtual: Sessao | undefined,
): { reps: number; carga: number | null } {
  const daSessao = seriesDo(sessaoAtual, exercicio.id);
  const ultima = daSessao[daSessao.length - 1];
  if (ultima) return { reps: ultima.reps, carga: ultima.carga_kg };

  const anterior = ultimaVezDoExercicio(treino, exercicio.id, sessaoAtual?.data ?? "");
  if (anterior) {
    const ultimaAnterior = anterior.series[anterior.series.length - 1];
    return { reps: ultimaAnterior.reps, carga: ultimaAnterior.carga_kg };
  }
  return { reps: exercicio.reps, carga: exercicio.carga_kg };
}

export interface LinhaDoHistorico {
  sessaoId: string;
  data: string;
  treinoId: string;
  treino: string;
  feitas: number;
  total: number;
  volume: number;
  concluida: boolean;
}

/** As últimas idas, da mais recente para a mais antiga. Só entra o que teve série ou foi concluído. */
export function historico(treinos: Treino[], limite = 10): LinhaDoHistorico[] {
  const linhas: LinhaDoHistorico[] = [];
  for (const treino of treinos) {
    const total = treino.exercicios.reduce((soma, e) => soma + e.series, 0);
    for (const sessao of treino.sessoes) {
      if (sessao.series.length === 0 && !sessao.concluida_em) continue;
      linhas.push({
        sessaoId: sessao.id,
        data: sessao.data,
        treinoId: treino.id,
        treino: treino.nome,
        feitas: sessao.series.length,
        total,
        volume: volumeDa(sessao),
        concluida: Boolean(sessao.concluida_em),
      });
    }
  }
  return linhas.sort((a, b) => b.data.localeCompare(a.data)).slice(0, limite);
}

/** "2026-10-06" → "06/10". Sem `new Date`, para não depender do fuso. */
export function dataCurta(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

/** Soma dias a uma data ISO. O meio-dia evita que o horário de verão mude o dia. */
export function somaDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia + dias, 12);
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}`;
}

/**
 * A data como a pessoa pensa nela: "hoje", "ontem", "há 3 dias". Acima de uma
 * semana volta a ser a data, porque "há 23 dias" ninguém converte de cabeça.
 */
export function dataRelativa(iso: string, hoje: string): string {
  if (iso === hoje) return "hoje";
  if (iso === somaDias(hoje, -1)) return "ontem";
  for (let dias = 2; dias <= 7; dias += 1) {
    if (iso === somaDias(hoje, -dias)) return `há ${dias} dias`;
  }
  return dataCurta(iso);
}

/** Quantos treinos foram concluídos nos últimos 7 dias, contando hoje. */
export function treinosNaSemana(treinos: Treino[], hoje: string): number {
  const limite = somaDias(hoje, -6);
  let total = 0;
  for (const treino of treinos) {
    for (const sessao of treino.sessoes) {
      if (sessao.concluida_em && sessao.data >= limite && sessao.data <= hoje) total += 1;
    }
  }
  return total;
}

/** Os quilos levantados nos últimos 7 dias, contando as idas em aberto. */
export function volumeNaSemana(treinos: Treino[], hoje: string): number {
  const limite = somaDias(hoje, -6);
  let total = 0;
  for (const treino of treinos) {
    for (const sessao of treino.sessoes) {
      if (sessao.data >= limite && sessao.data <= hoje) total += volumeDa(sessao);
    }
  }
  return total;
}

/**
 * A última vez que este exercício foi feito antes de hoje: é a referência de
 * carga que a pessoa procura antes de escolher o peso da próxima série.
 */
export function ultimaVezDoExercicio(
  treino: Treino,
  exercicioId: string,
  exceto: string,
): { data: string; series: Serie[] } | null {
  const anteriores = [...treino.sessoes].filter((s) => s.data !== exceto).sort((a, b) => b.data.localeCompare(a.data));
  for (const sessao of anteriores) {
    const series = seriesDo(sessao, exercicioId);
    if (series.length > 0) return { data: sessao.data, series };
  }
  return null;
}

/** "12 × 20 kg" de cada série, ou "12 reps" quando foi sem carga. */
export function descreverSerie(serie: Serie): string {
  return serie.carga_kg ? `${serie.reps} × ${serie.carga_kg} kg` : `${serie.reps} reps`;
}

/** Quanto tempo a ida durou, em minutos. Null enquanto não terminou. */
export function duracaoEmMinutos(sessao: Sessao): number | null {
  if (!sessao.concluida_em) return null;
  const inicio = Date.parse(sessao.iniciada_em);
  const fim = Date.parse(sessao.concluida_em);
  if (!Number.isFinite(inicio) || !Number.isFinite(fim) || fim <= inicio) return null;
  return Math.max(1, Math.round((fim - inicio) / 60000));
}
