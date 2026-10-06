import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente do Supabase. É o mesmo projeto do LIFE OS: os usuários e a sessão
 * são compartilhados; as tabelas são as `academia_*` de `supabase/academia.sql`.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const configurado = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = configurado ? createClient(url, anonKey) : null;
