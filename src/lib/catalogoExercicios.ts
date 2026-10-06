/**
 * O catálogo de exercícios do LIFE OS.
 *
 * Cada exercício tem o nome, o músculo, o equipamento, o nível e o passo a
 * passo em português, mais duas fotos (começo e fim do movimento) que moram em
 * `public/exercicios/<id>/0.jpg` e `1.jpg`.
 *
 * Fotos e ids vêm do "Free Exercise DB" (github.com/yuhonas/free-exercise-db),
 * um conjunto de domínio público (Unlicense). O id é o mesmo da pasta da foto —
 * é por ele que o treino guarda a referência. Os textos são nossos.
 *
 * O catálogo é do app, igual para todo mundo: não vai para a conta. O que vai
 * para a conta são os treinos montados a partir dele.
 *
 * O módulo é puro e não importa nada: o gerador de treinos (`treinoPlano`) e o
 * teste recebem o catálogo por argumento.
 */

export type Grupo =
  | "peito"
  | "costas"
  | "ombros"
  | "biceps"
  | "triceps"
  | "quadriceps"
  | "posteriores"
  | "gluteos"
  | "panturrilha"
  | "abdomen"
  | "cardio";

export type Equip = "barra" | "halteres" | "maquina" | "polia" | "corpo" | "cardio";

/**
 * `iniciante` entra em qualquer treino. `intermediario` pede técnica e, em geral,
 * carga livre pesada (barra, barra fixa, paralelas): fica fora do plano de quem
 * está começando.
 */
export type Nivel = "iniciante" | "intermediario";

export interface ExercicioDoCatalogo {
  /** O mesmo id da pasta das fotos. */
  id: string;
  nome: string;
  grupo: Grupo;
  equip: Equip;
  nivel: Nivel;
  /** Mexe em várias articulações (agachar, remar) ou isola um músculo (rosca, extensora). */
  composto: boolean;
  /** O passo a passo, em frases curtas. */
  como: string[];
  /** O erro mais comum, ou o que mais importa. */
  dica: string;
}

export const GRUPO_LABEL: Record<Grupo, string> = {
  peito: "Peito",
  costas: "Costas",
  ombros: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  quadriceps: "Quadríceps",
  posteriores: "Posterior da coxa",
  gluteos: "Glúteos",
  panturrilha: "Panturrilha",
  abdomen: "Abdômen",
  cardio: "Cardio",
};

export const EQUIP_LABEL: Record<Equip, string> = {
  barra: "Barra",
  halteres: "Halteres",
  maquina: "Máquina",
  polia: "Polia",
  corpo: "Peso do corpo",
  cardio: "Aparelho de cardio",
};

export const GRUPOS: Grupo[] = [
  "peito",
  "costas",
  "ombros",
  "biceps",
  "triceps",
  "quadriceps",
  "posteriores",
  "gluteos",
  "panturrilha",
  "abdomen",
  "cardio",
];

/** O caminho da foto: 0 é o começo do movimento, 1 é o fim. */
export function fotoDoExercicio(id: string, indice: 0 | 1 = 0): string {
  return `/exercicios/${id}/${indice}.jpg`;
}

const e = (
  id: string,
  nome: string,
  grupo: Grupo,
  equip: Equip,
  nivel: Nivel,
  composto: boolean,
  como: string[],
  dica: string,
): ExercicioDoCatalogo => ({ id, nome, grupo, equip, nivel, composto, como, dica });

export const CATALOGO: ExercicioDoCatalogo[] = [
  /* ------------------------------------------------------------------ peito */
  e("Barbell_Bench_Press_-_Medium_Grip", "Supino reto com barra", "peito", "barra", "intermediario", true,
    ["Deite no banco com os olhos sob a barra, pés firmes no chão e as escápulas juntas.", "Tire a barra do suporte, desça controlada até tocar de leve o meio do peito e empurre até estender os braços."],
    "Cotovelos a cerca de 45° do tronco, não abertos. Peça um parceiro ou use os suportes de segurança."),
  e("Dumbbell_Bench_Press", "Supino reto com halteres", "peito", "halteres", "iniciante", true,
    ["Deite no banco com um halter em cada mão, na altura do peito, palmas para frente.", "Empurre os halteres para cima até quase estender os braços e desça devagar até sentir o peito alongar."],
    "Mais amplitude que a barra: desça só até onde o ombro não incomoda."),
  e("Incline_Dumbbell_Press", "Supino inclinado com halteres", "peito", "halteres", "iniciante", true,
    ["Ajuste o banco a uns 30–45° e sente com as costas apoiadas e um halter em cada mão.", "Empurre os halteres para cima, juntando-os de leve no alto, e desça controlado até a altura do peito."],
    "Inclinação muito alta tira o peito e passa o trabalho para o ombro."),
  e("Barbell_Incline_Bench_Press_-_Medium_Grip", "Supino inclinado com barra", "peito", "barra", "intermediario", true,
    ["Banco inclinado a 30–45°, pés no chão e escápulas juntas. Tire a barra do suporte.", "Desça até a parte alta do peito e empurre para cima, em linha reta."],
    "Mantenha o quadril no banco e os punhos firmes, alinhados com o antebraço."),
  e("Machine_Bench_Press", "Supino na máquina", "peito", "maquina", "iniciante", true,
    ["Ajuste o banco para que as pegadas fiquem na altura do meio do peito e sente com as costas coladas.", "Empurre as pegadas para frente até quase estender os braços e volte devagar."],
    "Ótimo para aprender o movimento: a máquina guia a trajetória."),
  e("Butterfly", "Voador (peck deck)", "peito", "maquina", "iniciante", false,
    ["Sente com as costas apoiadas, cotovelos levemente flexionados e os braços abertos nas almofadas.", "Junte os braços à frente do peito, segure um instante e volte controlado."],
    "Não deixe os ombros subirem nem passe da linha do peito na volta."),
  e("Dumbbell_Flyes", "Crucifixo com halteres", "peito", "halteres", "iniciante", false,
    ["Deite no banco com os halteres acima do peito, cotovelos levemente flexionados.", "Abra os braços em arco até sentir o peito alongar e volte juntando os halteres acima do peito."],
    "Use pouca carga: o cotovelo fica semiflexionado o tempo todo, sem virar um supino."),
  e("Cable_Crossover", "Crossover na polia", "peito", "polia", "iniciante", false,
    ["Fique em pé entre as polias altas, um passo à frente, tronco levemente inclinado e uma mão em cada cabo.", "Traga as mãos para frente e para baixo, cruzando à frente do quadril, e volte devagar."],
    "O movimento é de abraçar, não de empurrar: mantenha o cotovelo semiflexionado."),
  e("Pushups", "Flexão de braço", "peito", "corpo", "iniciante", true,
    ["Mãos no chão um pouco mais abertas que os ombros, corpo reto da cabeça aos calcanhares.", "Desça até o peito quase tocar o chão e empurre de volta sem deixar o quadril cair."],
    "Não consegue? Faça a versão inclinada, com as mãos no banco."),
  e("Incline_Push-Up", "Flexão inclinada (mãos no banco)", "peito", "corpo", "iniciante", true,
    ["Apoie as mãos num banco ou barra firme, corpo reto, pés no chão.", "Desça o peito até o apoio e empurre de volta, mantendo o abdômen firme."],
    "Quanto mais alto o apoio, mais fácil. Vá baixando o apoio conforme ganhar força."),

  /* ----------------------------------------------------------------- costas */
  e("Wide-Grip_Lat_Pulldown", "Puxada na frente (pegada aberta)", "costas", "polia", "iniciante", true,
    ["Sente com as coxas presas, pegue a barra mais aberta que os ombros e incline o tronco levemente para trás.", "Puxe a barra até a altura do queixo, levando os cotovelos para baixo e para trás, e volte devagar."],
    "Pense em puxar com os cotovelos, não com as mãos. Evite balançar o tronco."),
  e("Close-Grip_Front_Lat_Pulldown", "Puxada com pegada fechada", "costas", "polia", "iniciante", true,
    ["Sente com as coxas presas e pegue a barra com as mãos na largura dos ombros ou um pouco menos.", "Puxe até o alto do peito, aproximando as escápulas, e volte com os braços estendidos."],
    "Peito aberto e ombros longe das orelhas durante todo o movimento."),
  e("Underhand_Cable_Pulldowns", "Puxada supinada", "costas", "polia", "iniciante", true,
    ["Sente na máquina e pegue a barra com as palmas viradas para você, na largura dos ombros.", "Puxe até o queixo, cotovelos junto ao corpo, e retorne controlado."],
    "Trabalha também o bíceps: se ele cansar primeiro, reduza a carga e foque nas costas."),
  e("Seated_Cable_Rows", "Remada baixa na polia", "costas", "polia", "iniciante", true,
    ["Sente com os pés apoiados, joelhos levemente flexionados e o tronco ereto, segurando o triângulo.", "Puxe até o abdômen, juntando as escápulas, e volte esticando os braços sem arredondar as costas."],
    "Tronco parado: o movimento é dos braços e das escápulas, não do balanço do corpo."),
  e("Bent_Over_Barbell_Row", "Remada curvada com barra", "costas", "barra", "intermediario", true,
    ["Em pé, joelhos flexionados, incline o tronco quase paralelo ao chão com a coluna reta e a barra pendurada.", "Puxe a barra até a parte baixa do abdômen e desça controlado, sem levantar o tronco."],
    "Coluna neutra o tempo todo. Se a lombar arredonda, reduza a carga."),
  e("One-Arm_Dumbbell_Row", "Remada unilateral (serrote)", "costas", "halteres", "iniciante", true,
    ["Apoie uma mão e o joelho do mesmo lado no banco, coluna reta, e segure o halter com o outro braço.", "Puxe o halter até a lateral do tronco, cotovelo junto ao corpo, e desça alongando as costas."],
    "Não gire o tronco para ajudar: mantenha os ombros alinhados."),
  e("Bent_Over_Two-Dumbbell_Row", "Remada curvada com halteres", "costas", "halteres", "iniciante", true,
    ["Incline o tronco com a coluna reta e os joelhos flexionados, um halter em cada mão.", "Puxe os dois halteres para as laterais do abdômen e desça com controle."],
    "Olhe para o chão, pescoço alinhado com a coluna."),
  e("T-Bar_Row_with_Handle", "Remada cavalinho", "costas", "barra", "intermediario", true,
    ["Posicione-se sobre a barra T, joelhos flexionados, tronco inclinado e coluna reta, segurando as pegadas.", "Puxe a carga em direção ao peito e desça devagar."],
    "Evite impulso com o quadril: a carga sobe pelas costas."),
  e("Leverage_High_Row", "Remada alta na máquina", "costas", "maquina", "iniciante", true,
    ["Ajuste o assento e sente com o peito apoiado, segurando as pegadas à frente.", "Puxe as pegadas em direção ao corpo, juntando as escápulas, e volte devagar."],
    "Mantenha o peito no apoio; o trabalho é de costas, não de balanço."),
  e("Pullups", "Barra fixa (pegada pronada)", "costas", "corpo", "intermediario", true,
    ["Pendure-se na barra com as palmas para frente, mãos um pouco mais abertas que os ombros.", "Puxe o corpo até o queixo passar da barra e desça até estender os braços."],
    "Ainda não consegue? Use a puxada na frente até ganhar força."),
  e("Chin-Up", "Barra fixa supinada", "costas", "corpo", "intermediario", true,
    ["Pendure-se na barra com as palmas viradas para você, na largura dos ombros.", "Puxe até o queixo passar da barra e desça controlado."],
    "Pegada que exige mais bíceps; desça sempre até os braços estendidos."),
  e("Straight-Arm_Pulldown", "Pulldown com braços estendidos", "costas", "polia", "iniciante", false,
    ["Em pé diante da polia alta, tronco levemente inclinado, braços estendidos segurando a barra.", "Leve a barra até as coxas em arco, mantendo os braços quase retos, e volte devagar."],
    "Sinta o dorsal trabalhando: os cotovelos mal dobram."),
  e("Inverted_Row", "Remada invertida", "costas", "corpo", "iniciante", true,
    ["Deite sob uma barra baixa, segure-a com as palmas para frente e deixe o corpo reto, calcanhares no chão.", "Puxe o peito até a barra e desça devagar."],
    "Corpo em prancha o tempo todo. Dobre os joelhos para facilitar."),
  e("Hyperextensions_Back_Extensions", "Extensão lombar (banco romano)", "costas", "corpo", "iniciante", false,
    ["Apoie o quadril no banco com os pés presos e o tronco para baixo, braços cruzados no peito.", "Suba o tronco até alinhar com as pernas e desça com controle."],
    "Não hiperestenda no alto: pare quando o corpo estiver em linha reta."),

  /* ----------------------------------------------------------------- ombros */
  e("Standing_Military_Press", "Desenvolvimento em pé com barra", "ombros", "barra", "intermediario", true,
    ["Em pé, barra apoiada na altura dos ombros, mãos na largura dos ombros, abdômen e glúteos firmes.", "Empurre a barra para cima até estender os braços, com a cabeça passando à frente da barra, e desça controlado."],
    "Não arqueie a lombar para empurrar: contraia o abdômen."),
  e("Dumbbell_Shoulder_Press", "Desenvolvimento com halteres", "ombros", "halteres", "iniciante", true,
    ["Sentado com as costas apoiadas, segure um halter em cada mão na altura das orelhas.", "Empurre para cima até estender os braços e desça devagar até a altura das orelhas."],
    "Antebraços na vertical durante o movimento; não bata os halteres no alto."),
  e("Machine_Shoulder_Military_Press", "Desenvolvimento na máquina", "ombros", "maquina", "iniciante", true,
    ["Ajuste o assento para que as pegadas fiquem na altura dos ombros e mantenha as costas apoiadas.", "Empurre até quase estender os braços e volte devagar."],
    "Boa opção para aprender a empurrar sobre a cabeça com segurança."),
  e("Arnold_Dumbbell_Press", "Desenvolvimento Arnold", "ombros", "halteres", "intermediario", true,
    ["Sentado, comece com os halteres à frente do peito e as palmas viradas para você.", "Empurre para cima girando as palmas para frente, termine com os braços estendidos e faça o caminho inverso na descida."],
    "Use carga menor que no desenvolvimento comum e controle a rotação."),
  e("Side_Lateral_Raise", "Elevação lateral", "ombros", "halteres", "iniciante", false,
    ["Em pé, um halter em cada mão ao lado do corpo e os cotovelos levemente flexionados.", "Levante os braços para os lados até a altura dos ombros e desça devagar."],
    "Carga leve e sem balançar o tronco. Suba o cotovelo, não a mão."),
  e("Front_Dumbbell_Raise", "Elevação frontal", "ombros", "halteres", "iniciante", false,
    ["Em pé, halteres à frente das coxas, braços quase estendidos.", "Levante um braço de cada vez até a altura dos ombros e desça controlado."],
    "Sem impulso: se precisar balançar, a carga está pesada."),
  e("Reverse_Flyes", "Crucifixo inverso com halteres", "ombros", "halteres", "iniciante", false,
    ["Incline o tronco à frente com a coluna reta, halteres pendurados e cotovelos levemente flexionados.", "Abra os braços para os lados até a altura do tronco, juntando as escápulas, e volte devagar."],
    "Trabalha o ombro de trás e a postura. Carga leve, movimento lento."),
  e("Reverse_Machine_Flyes", "Voador inverso (máquina)", "ombros", "maquina", "iniciante", false,
    ["Sente de frente para o encosto, peito apoiado, segurando as pegadas com os braços à frente.", "Abra os braços para trás até a linha dos ombros e volte devagar."],
    "Mantenha os ombros baixos e o peito colado no apoio."),
  e("Face_Pull", "Face pull na polia", "ombros", "polia", "iniciante", false,
    ["Polia na altura do rosto com a corda. Segure com as palmas viradas uma para a outra e dê um passo atrás.", "Puxe a corda em direção ao rosto, abrindo os cotovelos para os lados, e volte controlado."],
    "Ótimo para a saúde do ombro. Use carga leve e pare um instante no fim."),
  e("Dumbbell_Shrug", "Encolhimento com halteres", "ombros", "halteres", "iniciante", false,
    ["Em pé, um halter em cada mão ao lado do corpo, braços estendidos.", "Eleve os ombros em direção às orelhas, segure um instante e desça devagar."],
    "Só os ombros sobem: não gire os ombros nem dobre os cotovelos."),
  e("Barbell_Shrug", "Encolhimento com barra", "ombros", "barra", "iniciante", false,
    ["Em pé, segure a barra à frente das coxas com as mãos na largura dos ombros.", "Eleve os ombros ao máximo, segure um instante e desça controlado."],
    "Movimento curto e firme; sem balançar o corpo."),

  /* ------------------------------------------------------------------ bíceps */
  e("Barbell_Curl", "Rosca direta com barra", "biceps", "barra", "iniciante", false,
    ["Em pé, segure a barra com as palmas para cima na largura dos ombros e os cotovelos junto ao corpo.", "Flexione os cotovelos levando a barra até o peito e desça devagar até estender os braços."],
    "Cotovelos parados: se o corpo balança, a carga está pesada."),
  e("Dumbbell_Bicep_Curl", "Rosca com halteres", "biceps", "halteres", "iniciante", false,
    ["Em pé, um halter em cada mão ao lado do corpo, palmas para frente.", "Flexione os cotovelos levando os halteres aos ombros e desça devagar."],
    "Alterne os braços se preferir, mas sempre com o cotovelo junto ao corpo."),
  e("Hammer_Curls", "Rosca martelo", "biceps", "halteres", "iniciante", false,
    ["Em pé, halteres ao lado do corpo com as palmas viradas uma para a outra.", "Flexione os cotovelos mantendo essa pegada neutra e desça controlado."],
    "Trabalha bíceps e antebraço. Sem balançar o tronco."),
  e("Incline_Dumbbell_Curl", "Rosca inclinada", "biceps", "halteres", "iniciante", false,
    ["Sente num banco inclinado, costas apoiadas e braços pendurados com um halter em cada mão.", "Flexione os cotovelos até os ombros e desça alongando totalmente o bíceps."],
    "A posição alonga o bíceps: use carga mais leve que na rosca em pé."),
  e("Preacher_Curl", "Rosca Scott", "biceps", "barra", "iniciante", false,
    ["Apoie os braços no banco Scott, axilas no alto do apoio, e segure a barra com as palmas para cima.", "Flexione os cotovelos até a barra chegar ao peito e desça devagar sem estender totalmente."],
    "Não solte o peso no fim da descida: o cotovelo é vulnerável."),
  e("Concentration_Curls", "Rosca concentrada", "biceps", "halteres", "iniciante", false,
    ["Sentado, apoie o cotovelo na parte interna da coxa e segure o halter com o braço estendido.", "Flexione o cotovelo levando o halter ao ombro e desça controlado."],
    "Movimento lento e sem ajuda do corpo; ótimo para sentir o músculo."),
  e("Standing_Biceps_Cable_Curl", "Rosca na polia", "biceps", "polia", "iniciante", false,
    ["Em pé diante da polia baixa, segure a barra com as palmas para cima e os cotovelos junto ao corpo.", "Flexione os cotovelos até o peito e desça sem soltar a tensão do cabo."],
    "A polia mantém a tensão o tempo todo: não deixe o peso descansar na pilha."),
  e("EZ-Bar_Curl", "Rosca com barra W", "biceps", "barra", "iniciante", false,
    ["Segure a barra W nas partes anguladas, cotovelos junto ao corpo.", "Flexione os cotovelos até o peito e desça controlado."],
    "A barra W poupa os punhos, bom para quem sente desconforto na barra reta."),

  /* ----------------------------------------------------------------- tríceps */
  e("Triceps_Pushdown", "Tríceps na polia (barra)", "triceps", "polia", "iniciante", false,
    ["Em pé diante da polia alta, segure a barra com as mãos na largura dos ombros e os cotovelos colados ao corpo.", "Estenda os cotovelos empurrando a barra para baixo e volte até a altura do peito."],
    "Só o antebraço se mexe: cotovelos parados e ombros baixos."),
  e("Triceps_Pushdown_-_Rope_Attachment", "Tríceps na polia (corda)", "triceps", "polia", "iniciante", false,
    ["Em pé diante da polia alta com a corda, cotovelos junto ao corpo.", "Estenda os cotovelos e, no fim, abra as pontas da corda para os lados; volte devagar."],
    "Abrir a corda no final aumenta a contração do tríceps."),
  e("Bench_Dips", "Mergulho no banco", "triceps", "corpo", "iniciante", true,
    ["Apoie as mãos num banco atrás de você, pernas à frente, quadril próximo ao banco.", "Dobre os cotovelos até uns 90° e empurre de volta até estender os braços."],
    "Cotovelos apontando para trás, não para fora. Dobre os joelhos para facilitar."),
  e("Dips_-_Triceps_Version", "Paralelas (mergulho)", "triceps", "corpo", "intermediario", true,
    ["Apoie-se nas paralelas com os braços estendidos e o tronco reto, cotovelos próximos do corpo.", "Desça até os cotovelos ficarem em 90° e empurre de volta."],
    "Tronco ereto foca o tríceps; inclinado à frente, o peito. Desça só até onde o ombro estiver confortável."),
  e("Close-Grip_Barbell_Bench_Press", "Supino fechado", "triceps", "barra", "intermediario", true,
    ["Deite no banco e segure a barra com as mãos na largura dos ombros.", "Desça a barra até a parte baixa do peito, cotovelos junto ao corpo, e empurre para cima."],
    "Mãos mais próximas que isso sobrecarregam o punho sem ganho."),
  e("EZ-Bar_Skullcrusher", "Tríceps testa", "triceps", "barra", "intermediario", false,
    ["Deitado no banco, segure a barra W com os braços estendidos acima do peito.", "Dobre só os cotovelos descendo a barra em direção à testa e estenda de volta."],
    "Cotovelos apontando para o teto, sem abrir. Peso leve e controle total."),
  e("Cable_Rope_Overhead_Triceps_Extension", "Tríceps francês na polia", "triceps", "polia", "iniciante", false,
    ["De costas para a polia, segure a corda atrás da cabeça com os cotovelos apontando para frente.", "Estenda os braços à frente e acima da cabeça e volte devagar."],
    "Cotovelos fixos e perto da cabeça; sem arquear a lombar."),
  e("Tricep_Dumbbell_Kickback", "Tríceps coice", "triceps", "halteres", "iniciante", false,
    ["Incline o tronco apoiando uma mão no banco, cotovelo do outro braço junto ao corpo e flexionado a 90°.", "Estenda o cotovelo levando o halter para trás e volte controlado."],
    "O braço de cima fica parado; só o antebraço se move."),
  e("Machine_Triceps_Extension", "Extensão de tríceps na máquina", "triceps", "maquina", "iniciante", false,
    ["Sente na máquina com os cotovelos apoiados e as pegadas à frente.", "Estenda os braços empurrando as pegadas e volte devagar."],
    "Opção simples e segura para começar a trabalhar o tríceps."),
  e("Dumbbell_Tricep_Extension_-Pronated_Grip", "Tríceps francês com halter", "triceps", "halteres", "iniciante", false,
    ["Sentado ou em pé, segure um halter com as duas mãos acima da cabeça, braços estendidos.", "Dobre os cotovelos descendo o halter atrás da cabeça e estenda de volta."],
    "Cotovelos perto da cabeça e apontando para cima."),

  /* -------------------------------------------------------------- quadríceps */
  e("Barbell_Squat", "Agachamento livre com barra", "quadriceps", "barra", "intermediario", true,
    ["Barra apoiada nas costas, pés na largura dos ombros e pontas levemente abertas.", "Desça empurrando o quadril para trás e os joelhos na direção dos pés, até as coxas ficarem paralelas ao chão, e suba empurrando o chão."],
    "Coluna neutra e joelhos alinhados com os pés. Use os suportes de segurança."),
  e("Goblet_Squat", "Agachamento goblet", "quadriceps", "halteres", "iniciante", true,
    ["Segure um halter junto ao peito com as duas mãos, pés um pouco mais abertos que os ombros.", "Agache mantendo o tronco ereto até as coxas ficarem paralelas ao chão e suba."],
    "Ótimo para aprender a agachar: o peso à frente ajuda a manter o tronco reto."),
  e("Leg_Press", "Leg press 45°", "quadriceps", "maquina", "iniciante", true,
    ["Sente na máquina com as costas e o quadril apoiados e os pés na plataforma na largura dos ombros.", "Destrave, desça os joelhos em direção ao peito e empurre de volta sem travar os joelhos."],
    "Não deixe o quadril descolar do banco na descida e não trave os joelhos no alto."),
  e("Hack_Squat", "Hack squat", "quadriceps", "maquina", "iniciante", true,
    ["Apoie as costas e os ombros na máquina, pés na plataforma na largura dos ombros.", "Desça flexionando os joelhos e suba empurrando a plataforma."],
    "Pés mais baixos exigem mais quadríceps; mais altos, mais glúteos."),
  e("Leg_Extensions", "Cadeira extensora", "quadriceps", "maquina", "iniciante", false,
    ["Sente com as costas apoiadas e o apoio dos tornozelos logo acima dos pés.", "Estenda os joelhos até quase retos, segure um instante e desça devagar."],
    "Sem tranco no fim do movimento: o joelho agradece."),
  e("Dumbbell_Lunges", "Afundo com halteres", "quadriceps", "halteres", "iniciante", true,
    ["Em pé com um halter em cada mão, dê um passo largo à frente.", "Desça até o joelho de trás quase tocar o chão e volte à posição inicial; alterne as pernas."],
    "Tronco ereto e joelho da frente alinhado com o pé."),
  e("Split_Squat_with_Dumbbells", "Avanço estático (split squat)", "quadriceps", "halteres", "iniciante", true,
    ["Com uma perna à frente e a outra atrás, pés fixos no chão, halteres ao lado do corpo.", "Desça dobrando os dois joelhos e suba sem tirar os pés do lugar."],
    "Mais estável que o afundo andando: bom para trabalhar uma perna por vez."),
  e("Barbell_Walking_Lunge", "Passada com barra", "quadriceps", "barra", "intermediario", true,
    ["Com a barra nas costas, dê um passo à frente e desça até o joelho de trás quase tocar o chão.", "Impulsione com a perna da frente, traga a de trás ao lado e dê o próximo passo."],
    "Passos largos e tronco ereto. Comece sem carga para pegar o ritmo."),
  e("Bodyweight_Squat", "Agachamento (peso do corpo)", "quadriceps", "corpo", "iniciante", true,
    ["Pés na largura dos ombros, braços à frente para equilibrar.", "Agache empurrando o quadril para trás até as coxas ficarem paralelas ao chão e suba."],
    "Calcanhares no chão e peito aberto. Base para qualquer outro agachamento."),
  e("Smith_Machine_Squat", "Agachamento no Smith", "quadriceps", "maquina", "iniciante", true,
    ["Posicione a barra nas costas e os pés um pouco à frente da barra, na largura dos ombros.", "Desça até as coxas ficarem paralelas ao chão e suba."],
    "A barra guiada dá segurança, mas não deixe os joelhos passarem muito dos pés."),
  e("Dumbbell_Step_Ups", "Subida no banco (step-up)", "quadriceps", "halteres", "iniciante", true,
    ["Em frente a um banco firme, com um halter em cada mão, apoie um pé inteiro sobre ele.", "Suba empurrando com a perna do banco, encontre o topo com o corpo ereto e desça devagar; troque de perna."],
    "Use a perna de cima para subir, não impulso da de baixo."),
  e("Dumbbell_Squat", "Agachamento com halteres", "quadriceps", "halteres", "iniciante", true,
    ["Em pé com um halter em cada mão ao lado do corpo, pés na largura dos ombros.", "Agache mantendo o tronco reto até as coxas ficarem paralelas ao chão e suba."],
    "Segure os halteres firmes e olhe para frente."),

  /* ------------------------------------------------------------- posteriores */
  e("Romanian_Deadlift", "Stiff (terra romeno)", "posteriores", "barra", "intermediario", true,
    ["Em pé com a barra à frente das coxas, joelhos levemente flexionados.", "Empurre o quadril para trás, descendo a barra rente às pernas até sentir o posterior alongar, e volte contraindo os glúteos."],
    "Coluna reta o tempo todo. O movimento é de quadril, não de agachar."),
  e("Stiff-Legged_Dumbbell_Deadlift", "Stiff com halteres", "posteriores", "halteres", "iniciante", true,
    ["Em pé com um halter em cada mão à frente das coxas, joelhos levemente flexionados.", "Empurre o quadril para trás, desça os halteres rente às pernas e volte estendendo o quadril."],
    "Sinta a parte de trás da coxa alongar; pare antes de arredondar a lombar."),
  e("Lying_Leg_Curls", "Mesa flexora", "posteriores", "maquina", "iniciante", false,
    ["Deite de bruços com o apoio logo acima dos calcanhares e o quadril colado no banco.", "Flexione os joelhos levando os calcanhares aos glúteos e desça devagar."],
    "Não levante o quadril do banco para ajudar."),
  e("Seated_Leg_Curl", "Cadeira flexora", "posteriores", "maquina", "iniciante", false,
    ["Sente com as costas apoiadas e o apoio dos tornozelos atrás das pernas.", "Flexione os joelhos puxando o apoio para baixo e volte controlado."],
    "Movimento lento, principalmente na volta."),
  e("Standing_Leg_Curl", "Flexora em pé", "posteriores", "maquina", "iniciante", false,
    ["Em pé na máquina, apoie o tornozelo no rolo e o corpo no encosto.", "Flexione o joelho levando o calcanhar ao glúteo e volte devagar; troque de perna."],
    "Mantenha o quadril parado e o abdômen firme."),
  e("Barbell_Deadlift", "Levantamento terra", "posteriores", "barra", "intermediario", true,
    ["Barra sobre o meio dos pés, pegada na largura dos ombros, quadril baixo, peito aberto e coluna reta.", "Empurre o chão e estenda quadril e joelhos juntos, com a barra rente às pernas, e desça no mesmo caminho."],
    "Coluna neutra do começo ao fim. Comece leve e peça para alguém conferir a técnica."),

  /* ------------------------------------------------------------------ glúteos */
  e("Barbell_Hip_Thrust", "Elevação pélvica com barra", "gluteos", "barra", "intermediario", true,
    ["Apoie as costas num banco, barra sobre o quadril (com proteção) e pés firmes no chão.", "Eleve o quadril até o tronco ficar alinhado com as coxas, contraindo os glúteos, e desça controlado."],
    "Queixo no peito e costelas para baixo: a força vem do glúteo, não da lombar."),
  e("Barbell_Glute_Bridge", "Ponte de glúteos com barra", "gluteos", "barra", "intermediario", true,
    ["Deitado no chão com a barra sobre o quadril, joelhos dobrados e pés apoiados.", "Eleve o quadril contraindo os glúteos e desça devagar."],
    "Pare no alto quando o corpo formar uma linha reta, sem arquear a lombar."),
  e("Single_Leg_Glute_Bridge", "Ponte de glúteos unilateral", "gluteos", "corpo", "iniciante", true,
    ["Deitada de costas, joelhos dobrados, uma perna estendida para cima.", "Eleve o quadril empurrando o pé de apoio no chão e desça devagar; troque de perna."],
    "Quadril nivelado: não deixe um lado cair."),
  e("Butt_Lift_Bridge", "Ponte de glúteos (peso do corpo)", "gluteos", "corpo", "iniciante", true,
    ["Deitado de costas, joelhos dobrados e pés apoiados no chão na largura do quadril.", "Eleve o quadril contraindo os glúteos, segure um instante e desça."],
    "Boa porta de entrada para a elevação pélvica com carga."),
  e("Glute_Kickback", "Coice de glúteo no solo", "gluteos", "corpo", "iniciante", false,
    ["Apoie-se nas mãos e nos joelhos, coluna reta.", "Estenda uma perna para trás e para cima contraindo o glúteo e volte sem encostar o joelho no chão."],
    "Sem arquear a lombar: o movimento termina na altura do quadril."),
  e("One-Legged_Cable_Kickback", "Coice na polia", "gluteos", "polia", "iniciante", false,
    ["Prenda a caneleira no tornozelo, apoie-se na máquina e incline levemente o tronco.", "Leve a perna para trás contraindo o glúteo e volte devagar; troque de perna."],
    "Tronco firme: só a perna trabalha."),
  e("Pull_Through", "Pull-through na polia", "gluteos", "polia", "iniciante", true,
    ["De costas para a polia baixa, segure a corda entre as pernas e incline o tronco com a coluna reta.", "Estenda o quadril levando-o à frente, contraindo os glúteos, e volte empurrando o quadril para trás."],
    "É um movimento de dobradiça de quadril, com joelhos levemente flexionados."),
  e("Thigh_Abductor", "Cadeira abdutora", "gluteos", "maquina", "iniciante", false,
    ["Sente com as costas apoiadas e as almofadas na parte externa dos joelhos.", "Abra as pernas contra a resistência, segure um instante e volte devagar."],
    "Sem balançar o tronco; incline levemente à frente para sentir mais o glúteo."),

  /* ------------------------------------------------------------- panturrilha */
  e("Standing_Calf_Raises", "Panturrilha em pé na máquina", "panturrilha", "maquina", "iniciante", false,
    ["Apoie os ombros nas almofadas e a ponta dos pés na plataforma, calcanhares soltos.", "Suba o máximo que conseguir, segure um instante e desça alongando bem a panturrilha."],
    "Amplitude completa: desça tudo e suba tudo, sem quicar."),
  e("Seated_Calf_Raise", "Panturrilha sentado", "panturrilha", "maquina", "iniciante", false,
    ["Sente com a ponta dos pés na plataforma e as almofadas sobre os joelhos.", "Suba os calcanhares, segure e desça alongando."],
    "Trabalha o músculo mais profundo da panturrilha."),
  e("Calf_Press_On_The_Leg_Press_Machine", "Panturrilha no leg press", "panturrilha", "maquina", "iniciante", false,
    ["Sente no leg press e apoie só a ponta dos pés na plataforma, joelhos quase estendidos.", "Empurre com a ponta dos pés e volte alongando a panturrilha."],
    "Não flexione os joelhos: o movimento é só no tornozelo."),
  e("Standing_Dumbbell_Calf_Raise", "Panturrilha em pé com halteres", "panturrilha", "halteres", "iniciante", false,
    ["Em pé na beirada de um degrau com um halter em cada mão.", "Suba na ponta dos pés e desça os calcanhares abaixo do degrau."],
    "Segure-se em algo para o equilíbrio e foque na amplitude."),

  /* ------------------------------------------------------------------ abdômen */
  e("Crunches", "Abdominal crunch", "abdomen", "corpo", "iniciante", false,
    ["Deitado de costas, joelhos dobrados e mãos ao lado da cabeça ou cruzadas no peito.", "Levante os ombros do chão contraindo o abdômen e desça devagar."],
    "Não puxe o pescoço: o olhar vai para o teto."),
  e("Plank", "Prancha", "abdomen", "corpo", "iniciante", false,
    ["Apoie os antebraços e a ponta dos pés no chão, corpo reto da cabeça aos calcanhares.", "Mantenha a posição, abdômen e glúteos contraídos, respirando normalmente."],
    "Não deixe o quadril cair nem subir. Qualidade vale mais que tempo."),
  e("Side_Bridge", "Prancha lateral", "abdomen", "corpo", "iniciante", false,
    ["Deitado de lado, apoie o antebraço no chão com o cotovelo sob o ombro e as pernas estendidas.", "Eleve o quadril até o corpo formar uma linha reta e mantenha; troque de lado."],
    "Quadril alto e alinhado; não deixe o corpo girar."),
  e("Cable_Crunch", "Abdominal na polia (corda)", "abdomen", "polia", "iniciante", false,
    ["Ajoelhe-se diante da polia alta, segure a corda junto à cabeça.", "Flexione o tronco levando os cotovelos em direção aos joelhos, contraindo o abdômen, e volte devagar."],
    "O movimento é do abdômen, não do quadril. Mantenha o quadril parado."),
  e("Flat_Bench_Lying_Leg_Raise", "Elevação de pernas deitado", "abdomen", "corpo", "iniciante", false,
    ["Deitado no banco com as mãos segurando as bordas, pernas estendidas.", "Eleve as pernas até a vertical sem tirar a lombar do banco e desça devagar sem encostar no chão."],
    "Se a lombar descola, dobre os joelhos."),
  e("Dead_Bug", "Dead bug", "abdomen", "corpo", "iniciante", false,
    ["Deitado de costas, braços para o teto e joelhos dobrados a 90°.", "Estenda lentamente o braço de um lado e a perna do lado oposto, mantendo a lombar no chão, e alterne."],
    "Lombar colada no chão durante todo o exercício; vá devagar."),
  e("Russian_Twist", "Rotação russa", "abdomen", "corpo", "intermediario", false,
    ["Sentado, tronco inclinado para trás e pés no chão (ou elevados), mãos juntas à frente do peito.", "Gire o tronco de um lado para o outro, levando as mãos até o lado do quadril."],
    "Gire o tronco, não só os braços. Comece sem peso."),
  e("Air_Bike", "Abdominal bicicleta", "abdomen", "corpo", "iniciante", false,
    ["Deitado de costas, mãos atrás da cabeça e pernas elevadas.", "Leve o cotovelo ao joelho oposto enquanto estende a outra perna e alterne num ritmo controlado."],
    "Faça devagar: girar o tronco é o que trabalha o abdômen."),
  e("Mountain_Climbers", "Escalador (mountain climber)", "abdomen", "corpo", "iniciante", true,
    ["Em posição de flexão com os braços estendidos e o corpo reto.", "Leve um joelho ao peito e troque rapidamente de perna, como se corresse no lugar."],
    "Quadril baixo e abdômen firme. Bom também como exercício de condicionamento."),
  e("Ab_Crunch_Machine", "Abdominal na máquina", "abdomen", "maquina", "iniciante", false,
    ["Sente na máquina, ajuste a carga e segure as pegadas junto ao peito.", "Flexione o tronco para frente contraindo o abdômen e volte devagar."],
    "Mantenha o quadril no assento; o movimento é só do tronco."),

  /* -------------------------------------------------------------------- cardio */
  e("Walking_Treadmill", "Caminhada na esteira", "cardio", "cardio", "iniciante", false,
    ["Comece num ritmo confortável por 3 a 5 minutos e aumente até um passo firme, em que ainda dê para conversar.", "Se quiser mais intensidade, aumente a inclinação em vez de correr."],
    "Não segure nas barras: balance os braços naturalmente."),
  e("Jogging_Treadmill", "Corrida leve na esteira", "cardio", "cardio", "iniciante", false,
    ["Aqueça caminhando por 3 minutos e passe a um trote leve.", "Mantenha um ritmo em que você consiga respirar de forma controlada."],
    "Passos curtos e postura ereta. Intercale com caminhada se precisar."),
  e("Bicycling_Stationary", "Bicicleta ergométrica", "cardio", "cardio", "iniciante", false,
    ["Ajuste o banco para que a perna fique quase estendida no ponto mais baixo do pedal.", "Pedale num ritmo constante, ajustando a resistência à intensidade desejada."],
    "Baixo impacto: boa opção para quem tem desconforto nos joelhos."),
  e("Elliptical_Trainer", "Elíptico", "cardio", "cardio", "iniciante", false,
    ["Suba no aparelho com os pés bem apoiados e segure as alças.", "Mova pernas e braços num ritmo contínuo, ajustando a resistência."],
    "Postura ereta, sem se apoiar demais nas alças."),
  e("Rowing_Stationary", "Remo ergométrico", "cardio", "cardio", "iniciante", true,
    ["Sente com os pés presos, joelhos dobrados e segure a alça com os braços estendidos.", "Empurre com as pernas, incline o tronco e puxe a alça até o abdômen; volte na ordem inversa."],
    "A força vem primeiro das pernas, depois do tronco e por último dos braços."),
  e("Stairmaster", "Escada (stairmaster)", "cardio", "cardio", "iniciante", false,
    ["Suba no aparelho com o tronco ereto e apoie as mãos de leve nas barras.", "Suba os degraus num ritmo constante, pisando o pé inteiro."],
    "Evite se apoiar com o peso do corpo nas barras."),
];

const POR_ID = new Map(CATALOGO.map((item) => [item.id, item]));

export function acharExercicio(id: string | undefined | null): ExercicioDoCatalogo | undefined {
  return id ? POR_ID.get(id) : undefined;
}
