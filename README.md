# Academia

App de treino de musculação: os treinos montados uma vez, as séries de cada dia
e a carga de cada exercício. Feito para ser usado com o celular na mão, no
intervalo entre uma série e outra.

Next.js 16 (App Router) · React 19 · TypeScript · Supabase.

## O que ele faz

- **Treino de hoje** — sugere o treino parado há mais tempo e continua o que ficou em aberto.
- **Sessão guiada** — uma série por vez, com foto do começo e do fim do movimento,
  passo a passo, cronômetro de descanso que começa sozinho e a carga da última vez
  como referência.
- **Histórico** — séries, volume em quilos, duração e recorde de cada ida.

## Rodar

```bash
npm install
npm run dev        # http://localhost:4322
```

A porta é 4322 de propósito: a 4321 pertence ao LIFE OS e a 3000 a outro projeto.

```bash
npm run build      # build de produção
npm run typecheck  # tsc --noEmit
```

## Supabase

O app usa o mesmo projeto Supabase do LIFE OS, com **tabelas próprias**. Copie o
`.env.example` para `.env.local` e preencha com a URL e a chave `anon`
(Project Settings > API).

Depois, rode no SQL Editor, em ordem:

1. [`supabase/academia.sql`](supabase/academia.sql) — cria as tabelas e as políticas de RLS.
2. [`supabase/treinos-exemplo.sql`](supabase/treinos-exemplo.sql) — opcional, carrega
   três treinos de exemplo numa conta. Troque o e-mail no topo do arquivo.

A chave `anon` é pública por natureza: quem protege os dados é a RLS, que só
deixa cada conta ler e escrever as próprias linhas.

### Separação em relação ao LIFE OS

Mesmo banco, mesmas contas de `auth.users`, dados separados. Este app só toca em
`academia_treinos`, `academia_exercicios`, `academia_sessoes` e `academia_series`;
o LIFE OS só toca nas tabelas `lifeos_*`. Nada de um aparece no outro.

## Fotos dos exercícios

O catálogo em [`src/lib/catalogoExercicios.ts`](src/lib/catalogoExercicios.ts) tem
99 exercícios com duas fotos cada, em `public/exercicios/<id>/`. As fotos e os ids
vêm do [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), de domínio
público (Unlicense). Os textos de "como fazer" são próprios.

## Ainda não publicado

O app roda só em `localhost`. Para usar na academia ele precisa estar no ar —
Cloudflare Workers ou Vercel resolvem, e nenhum deles exige mudança no código
além das variáveis de ambiente.
