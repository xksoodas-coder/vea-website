/**
 * Seeds data/content.json with the placeholder catalogue.
 *
 * Run once: `node scripts/seed-content.mjs`
 * It refuses to overwrite an existing file unless you pass --force, so it can
 * never wipe catalogue data entered through the dashboard.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "data", "content.json");
const force = process.argv.includes("--force");

if (existsSync(target) && !force) {
  console.log(`✓ ${target} already exists — left untouched (use --force to reseed)`);
  process.exit(0);
}

const t = (fr, ar, en) => ({ fr, ar, en });

const lines = {
  hair: t("Soin des cheveux", "العناية بالشعر", "Hair care"),
  baby: t("Soin bébé", "عناية الطفل", "Baby care"),
  intime: t("Soin intime", "العناية الحميمة", "Intimate care"),
};

const categories = [
  { id: "featured", label: t("Meilleures ventes", "الأكثر طلبًا", "Best sellers") },
  { id: "shampoo", label: t("Shampooings", "الشامبو", "Shampoos") },
  { id: "conditioner", label: t("Après-shampooings", "البلسم", "Conditioners") },
  { id: "baby", label: t("Soin bébé", "عناية الطفل", "Baby care") },
  { id: "intime", label: t("Soin intime", "العناية الحميمة", "Intimate care") },
].map((c) => ({ ...c, image: null }));

const banners = [
  {
    id: "banner-1",
    image: "/images/banners/banner-1.svg",
    alt: t(
      "véa Hair Care — shampooings et après-shampooings",
      "véa Hair Care — الشامبو والبلسم",
      "véa Hair Care — shampoos and conditioners",
    ),
    href: "#products",
  },
  {
    id: "banner-2",
    image: "/images/banners/banner-2.svg",
    alt: t(
      "véa Natural Baby Care — la gamme soin bébé",
      "véa Natural Baby Care — مجموعة عناية الطفل",
      "véa Natural Baby Care — the baby care range",
    ),
    href: "#products",
  },
  {
    id: "banner-3",
    image: "/images/banners/banner-3.svg",
    alt: t(
      "véa Intime — la gamme de soin intime",
      "véa Intime — مجموعة العناية الحميمة",
      "véa Intime — the intimate care range",
    ),
    href: "#products",
  },
];

/** [slug, line, ml, categories, name, description] */
const rows = [
  [
    "shampooing-nutritif",
    "hair",
    400,
    ["shampoo", "featured"],
    t("Shampooing nutritif cheveux secs", "شامبو مغذٍّ للشعر الجاف", "Nourishing shampoo for dry hair"),
    t(
      "Un shampooing riche qui nourrit les cheveux secs et rend la chevelure souple et facile à démêler, lavage après lavage.",
      "شامبو غني يغذّي الشعر الجاف ويمنحه نعومة وسهولة في التسريح مع كل غسلة.",
      "A rich shampoo that nourishes dry hair, leaving it soft and easy to detangle wash after wash.",
    ),
  ],
  [
    "shampooing-quotidien",
    "hair",
    400,
    ["shampoo", "featured"],
    t("Shampooing usage quotidien", "شامبو للاستعمال اليومي", "Daily use shampoo"),
    t(
      "Une formule douce au pH équilibré, assez délicate pour un usage quotidien sur tous types de cheveux.",
      "تركيبة لطيفة متوازنة الحموضة، رقيقة بما يكفي للاستعمال اليومي على جميع أنواع الشعر.",
      "A gentle, pH-balanced formula mild enough for everyday use on all hair types.",
    ),
  ],
  [
    "shampooing-antipelliculaire",
    "hair",
    400,
    ["shampoo", "featured"],
    t("Shampooing antipelliculaire", "شامبو مضاد للقشرة", "Anti-dandruff shampoo"),
    t(
      "Aide à éliminer les pellicules et à apaiser le cuir chevelu tout en respectant sa barrière naturelle.",
      "يساعد على إزالة القشرة وتهدئة فروة الرأس مع الحفاظ على حاجزها الطبيعي.",
      "Helps clear dandruff and soothe the scalp while respecting its natural barrier.",
    ),
  ],
  [
    "shampooing-cheveux-gras",
    "hair",
    400,
    ["shampoo"],
    t("Shampooing cheveux gras", "شامبو للشعر الدهني", "Shampoo for oily hair"),
    t(
      "Purifie en douceur et régule l'excès de sébum pour des racines légères plus longtemps.",
      "ينظّف بلطف ويوازن إفراز الدهون لتبقى الجذور خفيفة لفترة أطول.",
      "Gently purifies and regulates excess sebum so roots stay light for longer.",
    ),
  ],
  [
    "shampooing-cheveux-colores",
    "hair",
    400,
    ["shampoo"],
    t("Shampooing cheveux colorés", "شامبو للشعر المصبوغ", "Shampoo for coloured hair"),
    t(
      "Nettoie sans agresser et aide à préserver l'éclat et la durée de la couleur.",
      "ينظّف دون قسوة ويساعد على حماية لمعان اللون وإطالة ثباته.",
      "Cleanses without stripping and helps preserve colour vibrancy and longevity.",
    ),
  ],

  [
    "apres-shampooing-hydratant",
    "hair",
    250,
    ["conditioner", "featured"],
    t("Après-shampooing hydratant", "بلسم مرطّب للشعر", "Hydrating conditioner"),
    t(
      "Hydrate et démêle instantanément pour des cheveux doux, brillants et faciles à coiffer.",
      "يرطّب ويفكّ التشابك فورًا للحصول على شعر ناعم لامع وسهل التصفيف.",
      "Instantly hydrates and detangles for soft, shiny, easy-to-style hair.",
    ),
  ],
  [
    "apres-shampooing-cheveux-colores",
    "hair",
    250,
    ["conditioner"],
    t("Après-shampooing cheveux colorés", "بلسم للشعر المصبوغ", "Conditioner for coloured hair"),
    t(
      "Referme les écailles du cheveu et prolonge l'intensité de la couleur après chaque lavage.",
      "يغلق مسام الشعرة ويطيل شدّة اللون بعد كل غسلة.",
      "Seals the hair cuticle and extends colour intensity after every wash.",
    ),
  ],
  [
    "apres-shampooing-aux-huiles",
    "hair",
    250,
    ["conditioner"],
    t("Après-shampooing aux huiles", "بلسم مغذٍّ بالزيوت", "Nourishing oil conditioner"),
    t(
      "Enrichi en huiles végétales, il nourrit en profondeur les longueurs les plus sèches.",
      "غني بالزيوت النباتية، يغذّي الأطراف الجافة بعمق.",
      "Enriched with plant oils to deeply nourish the driest lengths.",
    ),
  ],
  [
    "apres-shampooing-reparateur",
    "hair",
    250,
    ["conditioner"],
    t("Après-shampooing réparateur", "بلسم ضد التقصّف", "Repairing conditioner"),
    t(
      "Aide à réparer les fibres abîmées et à limiter les fourches sur les cheveux fragilisés.",
      "يساعد على إصلاح الألياف التالفة والحدّ من التقصّف في الشعر الضعيف.",
      "Helps repair damaged fibres and limit split ends on weakened hair.",
    ),
  ],
  [
    "apres-shampooing-cheveux-secs",
    "hair",
    250,
    ["conditioner"],
    t("Après-shampooing cheveux secs", "بلسم للشعر الجاف", "Conditioner for dry hair"),
    t(
      "Une texture riche qui restaure le confort et la souplesse des cheveux très secs.",
      "قوام غني يعيد الراحة والليونة للشعر شديد الجفاف.",
      "A rich texture that restores comfort and suppleness to very dry hair.",
    ),
  ],
  [
    "apres-shampooing-leger",
    "hair",
    250,
    ["conditioner"],
    t("Après-shampooing léger quotidien", "بلسم يومي خفيف", "Light daily conditioner"),
    t(
      "Une texture légère qui démêle sans alourdir, idéale pour les cheveux fins.",
      "قوام خفيف يفكّ التشابك دون أن يثقل الشعر، مثالي للشعر الناعم.",
      "A light texture that detangles without weighing hair down — ideal for fine hair.",
    ),
  ],

  [
    "shampooing-bebe",
    "baby",
    250,
    ["baby", "shampoo", "featured"],
    t("Shampooing bébé", "شامبو الأطفال", "Baby shampoo"),
    t(
      "Formule sans larmes, testée sous contrôle dermatologique, pour laver en douceur les cheveux de bébé.",
      "تركيبة لا تسبب الدموع، مختبرة تحت إشراف طبي، لغسل شعر الطفل بلطف.",
      "A no-tears formula, dermatologically tested, to gently wash baby's hair.",
    ),
  ],
  [
    "gel-douche-bebe",
    "baby",
    250,
    ["baby"],
    t("Gel douche", "جل الاستحمام", "Shower gel"),
    t(
      "Nettoie le corps et les cheveux en une seule étape, sans dessécher la peau fragile de bébé.",
      "ينظّف الجسم والشعر في خطوة واحدة دون أن يجفّف بشرة الطفل الرقيقة.",
      "Cleanses body and hair in one step without drying baby's delicate skin.",
    ),
  ],
  [
    "lait-de-corps-bebe",
    "baby",
    250,
    ["baby"],
    t("Lait de corps", "حليب الجسم", "Body lotion"),
    t(
      "Un lait fondant qui hydrate et protège la peau de bébé au quotidien.",
      "حليب سريع الامتصاص يرطّب بشرة الطفل ويحميها يوميًا.",
      "A melt-in lotion that hydrates and protects baby's skin every day.",
    ),
  ],
  [
    "creme-de-change",
    "baby",
    250,
    ["baby"],
    t("Crème de change", "كريم الحفاض", "Nappy cream"),
    t(
      "Apaise et protège le siège de bébé à chaque change, dès la naissance.",
      "يهدئ ويحمي منطقة الحفاض عند كل تغيير، منذ الولادة.",
      "Soothes and protects baby's bottom at every change, from birth.",
    ),
  ],
  [
    "huile-de-massage",
    "baby",
    250,
    ["baby"],
    t("Huile de massage", "زيت التدليك", "Massage oil"),
    t(
      "Une huile légère qui nourrit la peau et accompagne le moment du massage.",
      "زيت خفيف يغذّي البشرة ويرافق لحظة التدليك.",
      "A light oil that nourishes the skin and accompanies massage time.",
    ),
  ],
  [
    "eau-nettoyante-sans-rincage",
    "baby",
    300,
    ["baby"],
    t("Eau nettoyante sans rinçage", "ماء منظّف بدون شطف", "No-rinse cleansing water"),
    t(
      "Nettoie le visage, le corps et le siège sans rinçage — pratique en déplacement.",
      "ينظّف الوجه والجسم ومنطقة الحفاض دون شطف — عملي أثناء التنقل.",
      "Cleanses face, body and nappy area with no rinsing — handy on the go.",
    ),
  ],

  [
    "gel-lavant-intime-fresh",
    "intime",
    200,
    ["intime", "featured"],
    t("Gel lavant intime — Fresh", "غسول حميم — فريش", "Intimate wash — Fresh"),
    t(
      "Fraîcheur longue durée et confort au quotidien, avec un pH respectueux de la flore intime.",
      "انتعاش طويل الأمد وراحة يومية، بحموضة تحترم التوازن الطبيعي للمنطقة الحميمة.",
      "Long-lasting freshness and daily comfort, with a pH that respects intimate flora.",
    ),
  ],
  [
    "gel-lavant-intime-daily",
    "intime",
    200,
    ["intime"],
    t("Gel lavant intime — Daily", "غسول حميم — يومي", "Intimate wash — Daily"),
    t(
      "Un nettoyage doux pensé pour un usage quotidien, sans dessécher.",
      "تنظيف لطيف مصمّم للاستعمال اليومي دون تجفيف.",
      "A gentle cleanse designed for everyday use, without drying.",
    ),
  ],
  [
    "gel-lavant-intime-confort",
    "intime",
    200,
    ["intime"],
    t("Gel lavant intime — Confort", "غسول حميم — كونفور", "Intimate wash — Comfort"),
    t(
      "Apaise les sensations de sécheresse intime et restaure le confort.",
      "يهدئ الإحساس بالجفاف في المنطقة الحميمة ويعيد الشعور بالراحة.",
      "Soothes intimate dryness and restores comfort.",
    ),
  ],
  [
    "gel-lavant-intime-probiotique",
    "intime",
    200,
    ["intime"],
    t("Gel lavant intime — Probiotique", "غسول حميم — بروبيوتيك", "Intimate wash — Probiotic"),
    t(
      "Enrichi en probiotiques pour aider à maintenir l'équilibre de la flore intime.",
      "غني بالبروبيوتيك للمساعدة في الحفاظ على توازن الفلورا الحميمة.",
      "Enriched with probiotics to help maintain intimate flora balance.",
    ),
  ],
  [
    "gel-lavant-intime-sensitive",
    "intime",
    200,
    ["intime"],
    t("Gel lavant intime — Sensitive", "غسول حميم — سنسيتيف", "Intimate wash — Sensitive"),
    t(
      "Formulé pour les peaux sensibles : apaisant, sans parfum agressif.",
      "مُصاغ للبشرة الحساسة: مهدّئ وبدون عطور قاسية.",
      "Formulated for sensitive skin: soothing, without harsh fragrance.",
    ),
  ],
];

const wipes = {
  id: "lingettes-intimes",
  slug: "lingettes-intimes",
  name: t("Lingettes intimes", "مناديل حميمة", "Intimate wipes"),
  description: t(
    "Des lingettes douces à emporter partout, pour une sensation de fraîcheur immédiate.",
    "مناديل لطيفة يمكن حملها في كل مكان، لإحساس فوري بالانتعاش.",
    "Gentle wipes to carry anywhere, for an instant feeling of freshness.",
  ),
  line: lines.intime,
  volumeMl: null,
  sizeLabel: t("20 lingettes", "20 منديلًا", "20 wipes"),
  categoryIds: ["intime"],
  images: ["/images/products/intime-wipes.svg"],
};

const legacyImages = {
  "shampooing-nutritif": "shampoo-nourishing",
  "shampooing-quotidien": "shampoo-daily",
  "shampooing-antipelliculaire": "shampoo-antidandruff",
  "shampooing-cheveux-gras": "shampoo-oily",
  "shampooing-cheveux-colores": "shampoo-color",
  "apres-shampooing-hydratant": "conditioner-hydra",
  "apres-shampooing-cheveux-colores": "conditioner-color",
  "apres-shampooing-aux-huiles": "conditioner-nutri",
  "apres-shampooing-reparateur": "conditioner-repair",
  "apres-shampooing-cheveux-secs": "conditioner-dry",
  "apres-shampooing-leger": "conditioner-light",
  "shampooing-bebe": "baby-shampoo",
  "gel-douche-bebe": "baby-douche",
  "lait-de-corps-bebe": "baby-lait",
  "creme-de-change": "baby-change",
  "huile-de-massage": "baby-massage",
  "eau-nettoyante-sans-rincage": "baby-water",
  "gel-lavant-intime-fresh": "intime-fresh",
  "gel-lavant-intime-daily": "intime-daily",
  "gel-lavant-intime-confort": "intime-confort",
  "gel-lavant-intime-probiotique": "intime-probiotique",
  "gel-lavant-intime-sensitive": "intime-sensitive",
};

const products = rows.map(([slug, line, ml, cats, name, description]) => ({
  id: slug,
  slug,
  name,
  description,
  line: lines[line],
  volumeMl: ml,
  sizeLabel: null,
  categoryIds: cats,
  images: [`/images/products/${legacyImages[slug]}.svg`],
}));

products.push(wipes);

mkdirSync(join(root, "data"), { recursive: true });
writeFileSync(
  target,
  JSON.stringify({ banners, categories, products }, null, 2),
  "utf8",
);

console.log(
  `✓ seeded ${products.length} products, ${categories.length} categories, ${banners.length} banners → data/content.json`,
);
