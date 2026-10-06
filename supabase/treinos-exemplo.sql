-- Treinos A, B e C de exemplo.
-- Troque o e-mail abaixo pelo da conta que vai receber os treinos.
-- Rode no SQL Editor depois de supabase/academia.sql.
--
-- Todas as repetições são 10. A carga fica em branco de propósito: ela escolhe
-- o peso na hora, e o app passa a sugerir o da última vez a partir da segunda ida.
-- A última coluna de cada exercício é o id no catálogo (fotos e passo a passo).

with dono as (select id from auth.users where email = 'TROQUE-PELO-SEU-EMAIL@exemplo.com'),
a as (
  insert into public.academia_treinos (user_id, nome, foco, ordem)
  select id, 'Treino A', 'Peito, tríceps e ombros', 0 from dono
  returning id, user_id
)
insert into public.academia_exercicios (user_id, treino_id, nome, series, reps, carga_kg, ordem, ref)
select a.user_id, a.id, v.nome, v.series, 10, null, v.ordem, v.ref
from a cross join (values
  -- A foto é a do supino com barra: é a única deitada do catálogo, e o que
  -- importa aqui é a posição do corpo, não o equipamento.
  ('Supino reto na máquina (deitado)', 3, 0, 'Barbell_Bench_Press_-_Medium_Grip'),
  ('Supino inclinado com halteres', 3, 1, 'Incline_Dumbbell_Press'),
  ('Crucifixo na polia', 3, 2, 'Cable_Crossover'),
  ('Desenvolvimento com halteres (ombros)', 3, 3, 'Dumbbell_Shoulder_Press'),
  ('Elevação lateral com halteres', 4, 4, 'Side_Lateral_Raise'),
  ('Tríceps pulley (corda)', 3, 5, 'Triceps_Pushdown_-_Rope_Attachment')
) as v(nome, series, ordem, ref);

with dono as (select id from auth.users where email = 'TROQUE-PELO-SEU-EMAIL@exemplo.com'),
b as (
  insert into public.academia_treinos (user_id, nome, foco, ordem)
  select id, 'Treino B', 'Costas, bíceps e abdômen', 1 from dono
  returning id, user_id
)
insert into public.academia_exercicios (user_id, treino_id, nome, series, reps, carga_kg, ordem, ref)
select b.user_id, b.id, v.nome, v.series, 10, null, v.ordem, v.ref
from b cross join (values
  ('Puxada alta aberta (pulley)', 3, 0, 'Wide-Grip_Lat_Pulldown'),
  ('Remada baixa sentada (triângulo)', 3, 1, 'Seated_Cable_Rows'),
  ('Remada unilateral com haltere (serrote), cada lado', 3, 2, 'One-Arm_Dumbbell_Row'),
  ('Crucifixo inverso com halteres', 3, 3, 'Reverse_Flyes'),
  ('Rosca direta (barra W ou halteres)', 3, 4, 'EZ-Bar_Curl'),
  ('Rosca martelo com halteres', 3, 5, 'Hammer_Curls'),
  ('Abdominal supra (solo)', 3, 6, 'Crunches')
) as v(nome, series, ordem, ref);

with dono as (select id from auth.users where email = 'TROQUE-PELO-SEU-EMAIL@exemplo.com'),
c as (
  insert into public.academia_treinos (user_id, nome, foco, ordem)
  select id, 'Treino C', 'Pernas completas', 2 from dono
  returning id, user_id
)
insert into public.academia_exercicios (user_id, treino_id, nome, series, reps, carga_kg, ordem, ref)
select c.user_id, c.id, v.nome, v.series, 10, null, v.ordem, v.ref
from c cross join (values
  ('Agachamento livre (ou no Smith)', 3, 0, 'Barbell_Squat'),
  ('Leg press 45°', 3, 1, 'Leg_Press'),
  ('Cadeira extensora (2 segundos de pausa no topo)', 3, 2, 'Leg_Extensions'),
  ('Mesa flexora', 3, 3, 'Lying_Leg_Curls'),
  ('Gêmeos sentado (panturrilha)', 4, 4, 'Seated_Calf_Raise')
) as v(nome, series, ordem, ref);
