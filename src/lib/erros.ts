/**
 * A mensagem de um erro, venha ele de onde vier.
 *
 * O erro do Supabase é um objeto simples, não uma instância de `Error`. Testar
 * por `instanceof Error` jogava fora justamente a mensagem que explica o
 * problema e deixava só o texto genérico na tela — foi o que escondeu, por
 * várias telas, um simples "column ref does not exist".
 */
export function mensagemDeErro(falha: unknown, padrao: string): string {
  if (falha instanceof Error && falha.message) return falha.message;
  const mensagem = (falha as { message?: unknown } | null)?.message;
  return typeof mensagem === "string" && mensagem.trim() ? mensagem : padrao;
}

/**
 * O erro em instrução, quando dá para saber o que fazer a respeito.
 *
 * "column academia_exercicios.ref does not exist" não diz a ninguém qual é o
 * próximo passo; "rode o SQL" diz.
 */
export function erroLegivel(falha: unknown, padrao: string): string {
  const mensagem = mensagemDeErro(falha, padrao);

  if (/relation .* does not exist|schema cache|column .* does not exist/i.test(mensagem)) {
    return "O banco ainda não tem as tabelas ou colunas desta versão. Rode o conteúdo de supabase/academia.sql no SQL Editor do Supabase e recarregue a página.";
  }
  if (/permission denied|row-level security|violates row-level/i.test(mensagem)) {
    return "O banco recusou a gravação por falta de permissão. Rode o conteúdo de supabase/academia.sql no SQL Editor do Supabase e entre de novo.";
  }
  if (/jwt|not authenticated|invalid token/i.test(mensagem)) {
    return "A sessão expirou. Saia e entre de novo.";
  }
  if (/failed to fetch|network|load failed/i.test(mensagem)) {
    return "Sem conexão com o servidor. O que você marcar agora pode não ter sido salvo.";
  }
  return mensagem;
}
