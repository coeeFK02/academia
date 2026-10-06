import { NextResponse } from "next/server";

/**
 * A configuração pública do Supabase, lida em tempo de execução.
 *
 * Existe porque as `NEXT_PUBLIC_*` são embutidas no momento do build: o deploy
 * sai do GitHub, onde o `.env.local` não está, e o app publicado subia sem saber
 * para onde apontar. Lido daqui, o valor vem do servidor a cada carga, e trocar
 * a chave não exige novo build.
 *
 * Aceita os dois nomes: `SUPABASE_*` para as variáveis do serviço em produção,
 * `NEXT_PUBLIC_SUPABASE_*` para o `.env.local` em desenvolvimento.
 *
 * A chave `anon` é pública por natureza — ela vai para o navegador de qualquer
 * visitante de qualquer jeito. Quem protege os dados são as políticas de RLS.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return NextResponse.json(
    { url, anonKey },
    // Sem cache: é isto que garante que uma troca de chave chegue na próxima carga.
    { headers: { "Cache-Control": "no-store" } },
  );
}
