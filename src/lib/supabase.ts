import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente do Supabase — o mesmo projeto do LIFE OS, nas tabelas `academia_*`.
 *
 * A configuração vem de `/api/config`, lida pelo servidor em tempo de execução,
 * e não só das `NEXT_PUBLIC_*` embutidas no build. O motivo é concreto: o build
 * publicado não enxerga o `.env.local` (ele não vai para o repositório), e o app
 * subia dizendo "falta apontar para o Supabase" com tudo certo aqui na máquina.
 *
 * O valor embutido, quando existe, continua servindo de atalho: evita uma ida ao
 * servidor em desenvolvimento.
 */

export interface Config {
  url: string;
  anonKey: string;
}

const embutida: Config = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

let config: Config | null = embutida.url && embutida.anonKey ? embutida : null;
let cliente: SupabaseClient | null = null;
let buscando: Promise<Config | null> | null = null;

/** A configuração, ou `null` quando não há projeto apontado — e aí quem chama explica o que falta. */
export async function carregarConfig(): Promise<Config | null> {
  if (config) return config;

  buscando ??= (async () => {
    try {
      const resposta = await fetch("/api/config", { cache: "no-store" });
      if (!resposta.ok) return null;
      const dados = (await resposta.json()) as Partial<Config>;
      if (!dados.url || !dados.anonKey) return null;
      config = { url: dados.url, anonKey: dados.anonKey };
      return config;
    } catch {
      return null;
    } finally {
      // Uma falha de rede não pode congelar a resposta para sempre.
      buscando = null;
    }
  })();

  return buscando;
}

/** O cliente, ou `null` enquanto não houver configuração. */
export function supabase(): SupabaseClient | null {
  if (!config) return null;
  // Uma instância só: cada `createClient` abre o seu próprio canal de sessão.
  cliente ??= createClient(config.url, config.anonKey);
  return cliente;
}
