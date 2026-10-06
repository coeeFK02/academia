--
-- Academia: treinos de musculação.
--
-- Roda no MESMO projeto Supabase do LIFE OS, mas em tabelas próprias
-- (prefixo `academia_`). Nada aqui toca em `lifeos_*`. Os usuários são os
-- mesmos de `auth.users`, então a conta que entra no LIFE OS entra aqui.
--
-- Rode este arquivo uma vez no SQL Editor do Supabase. Pode rodar de novo sem
-- perder dados: tudo usa `if not exists` / `drop policy if exists`.
--

create table if not exists public.academia_treinos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nome text not null,
  foco text not null default '',
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.academia_exercicios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  treino_id uuid not null references public.academia_treinos on delete cascade,
  nome text not null,
  -- Séries e repetições planejadas. A carga planejada é só o ponto de partida:
  -- o que vale de verdade é o que foi registrado em `academia_series`.
  series integer not null default 3 check (series between 1 and 10),
  reps integer not null default 10 check (reps between 1 and 100),
  carga_kg numeric(6,2) check (carga_kg is null or carga_kg >= 0),
  ordem integer not null default 0
);

-- Uma ida à academia por treino por dia.
create table if not exists public.academia_sessoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  treino_id uuid not null references public.academia_treinos on delete cascade,
  data date not null,
  iniciada_em timestamptz not null default now(),
  concluida_em timestamptz,
  unique (treino_id, data)
);

-- Cada série feita, com a carga e as repetições que de fato saíram.
create table if not exists public.academia_series (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  sessao_id uuid not null references public.academia_sessoes on delete cascade,
  exercicio_id uuid not null references public.academia_exercicios on delete cascade,
  numero integer not null check (numero >= 1),
  reps integer not null check (reps between 0 and 1000),
  carga_kg numeric(6,2) check (carga_kg is null or carga_kg >= 0),
  feita_em timestamptz not null default now(),
  unique (sessao_id, exercicio_id, numero)
);

create index if not exists academia_treinos_user_idx on public.academia_treinos (user_id, ordem);
create index if not exists academia_exercicios_treino_idx on public.academia_exercicios (treino_id, ordem);
create index if not exists academia_sessoes_user_idx on public.academia_sessoes (user_id, data desc);
create index if not exists academia_series_sessao_idx on public.academia_series (sessao_id);

alter table public.academia_treinos enable row level security;
alter table public.academia_exercicios enable row level security;
alter table public.academia_sessoes enable row level security;
alter table public.academia_series enable row level security;

-- Cada linha só é vista e escrita pelo dono. As políticas de filhos também
-- conferem que o pai pertence ao mesmo dono: sem isso, alguém poderia pendurar
-- um exercício no treino de outra pessoa informando o id dele.
drop policy if exists "treinos: cada um os seus" on public.academia_treinos;
create policy "treinos: cada um os seus"
  on public.academia_treinos for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "exercicios: cada um os seus" on public.academia_exercicios;
create policy "exercicios: cada um os seus"
  on public.academia_exercicios for all
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.academia_treinos t where t.id = treino_id and t.user_id = auth.uid())
  );

drop policy if exists "sessoes: cada um as suas" on public.academia_sessoes;
create policy "sessoes: cada um as suas"
  on public.academia_sessoes for all
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.academia_treinos t where t.id = treino_id and t.user_id = auth.uid())
  );

drop policy if exists "series: cada um as suas" on public.academia_series;
create policy "series: cada um as suas"
  on public.academia_series for all
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.academia_sessoes s where s.id = sessao_id and s.user_id = auth.uid())
    and exists (select 1 from public.academia_exercicios e where e.id = exercicio_id and e.user_id = auth.uid())
  );

-- Anônimo não enxerga nada. Só quem está logado.
revoke all on public.academia_treinos, public.academia_exercicios,
  public.academia_sessoes, public.academia_series from anon;
grant select, insert, update, delete on public.academia_treinos, public.academia_exercicios,
  public.academia_sessoes, public.academia_series to authenticated;

--
-- Referência ao exercício do catálogo (`src/lib/catalogoExercicios.ts`), que
-- traz as fotos e o passo a passo. Nulo para exercícios escritos à mão.
-- Rode de novo este bloco se já tiver rodado o arquivo antes.
--
alter table public.academia_exercicios add column if not exists ref text;
