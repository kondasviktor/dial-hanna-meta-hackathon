// Bilingual landing copy (HU + EN). Source: Claude "Dial Hanna — Landing +
// Product UI" proposal + smarthivas.hu reference. Fictional demo businesses.

export type Lang = "hu" | "en";

export interface ScenarioLine {
  who: string;
  text: string;
  hanna: boolean;
}

export interface Scenario {
  label: string;
  biz: string;
  chip: string;
  chipBg: string;
  chipFg: string;
  intent: string;
  outcome: string;
  next: string;
  lines: ScenarioLine[];
}

export interface Check {
  name: string;
  warn?: boolean;
}

export interface Plan {
  name: string;
  tag: string;
  badge?: string;
  monthly: number;
  annual: number;
  minutes: string;
  noCalendar?: boolean;
  feats: string[];
  cta: string;
}

export interface LandingDict {
  nav: { how: string; get: string; industries: string; pricing: string; faq: string; signin: string; cta: string };
  hero: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    sub: string;
    primary: string;
    secondary: string;
    trust: string;
    panelCaption: string;
    panelBiz: string;
    afterTitle: string;
    intent: string;
    outcome: string;
    next: string;
    demoNote: string;
  };
  valuesTitle: string;
  values: { title: string; body: string }[];
  howTitle: string;
  howSub: string;
  steps: { title: string; body: string; extra?: string; code?: string; codeNote?: string }[];
  verifyTitle: string;
  verifyBody: string;
  getTitle: string;
  getSub: string;
  tabsNote: string;
  callLabel: string;
  afterDash: string;
  testTitle: string;
  testBody: string;
  testBody2: string;
  scoreLabel: string;
  scoreDetail: string;
  passLabel: string;
  reviewLabel: string;
  checks: Check[];
  learnTitle: string;
  learnSub: string;
  learn: { title: string; body: string }[];
  industriesTitle: string;
  industriesSub: string;
  verticals: { name: string; pain: string; does: string }[];
  industriesNote: string;
  hannaDoes: string;
  calcTitle: string;
  calcSub: string;
  calcDisclaimer: string;
  calc: {
    calls: string;
    callsUnit: (n: number) => string;
    share: string;
    avg: string;
    revenue: string;
    orders: string;
    ordersUnit: string;
    need: (plan: string) => string;
    needUnit: string;
    verdictOk: (orders: string, need: number) => string;
    verdictShort: (orders: string, need: number) => string;
    formula: string;
  };
  pricingTitle: string;
  pricingSub: string;
  pricingNote: string;
  monthly: string;
  annual: string;
  annualDeal: string;
  net: string;
  gross: string;
  grossNote: string;
  perMonth: string;
  perYear: string;
  perMonthApprox: string;
  billedMonthly: string;
  plans: Plan[];
  trialTitle: string;
  trialBody: string;
  overageTitle: string;
  overageBody: string;
  faqTitle: string;
  faqSub: string;
  faq: { q: string; a: string }[];
  finalTitle: string;
  finalSub: string;
  footerDemo: string;
  footerRights: string;
  privacy: string;
  terms: string;
  contact: string;
}

const hu: LandingDict = {
  nav: {
    how: "Hogyan működik",
    get: "Mit kapsz",
    industries: "Ágazatok",
    pricing: "Árak",
    faq: "GYIK",
    signin: "Belépés",
    cta: "Ingyen kipróbálom",
  },
  hero: {
    eyebrow: "MI-alapú híváslefedés kisvállalkozásoknak",
    titleA: "Ha nem érsz rá,",
    titleB: "Hanna felveszi.",
    sub: "Tartsd meg a saját számodat. Amikor munka közben nem tudod felvenni a telefont, Hanna a vállalkozásod nevében magyarul vagy angolul fogadja a hívást, időpontot foglal, és kész teendőt ad át — nem hangfelvételt.",
    primary: "Ingyen kipróbálom",
    secondary: "Hívd fel Hannát a böngészőből",
    trust: "14 nap, bankkártya nélkül · Hanna minden hívás első mondatában MI-asszisztensként mutatkozik be",
    panelCaption: "Átirányított hívás · 1:48",
    panelBiz: "Szalon Viola",
    afterTitle: "Hívás után",
    intent: "Szándék",
    outcome: "Eredmény",
    next: "Következő lépés",
    demoNote: "Szemléltető példa kitalált vállalkozással.",
  },
  valuesTitle: "Miért Hanna",
  values: [
    { title: "Megtartod a számodat", body: "Nincs új szám, nincs új app. Csak az átirányítást kapcsolod be." },
    { title: "Éles indulás előtt tesztelt", body: "20 próbahívás-forgatókönyv és egy látható pontszám, mielőtt élesítesz." },
    { title: "Nem találgat", body: "Csak a jóváhagyott tudásodból válaszol. Ha nem tudja, visszahívást ajánl." },
    { title: "A kapcsoló nálad van", body: "Egy kattintással Hanna kikapcsol, és a hívások újra csak hozzád futnak be." },
  ],
  howTitle: "Hogyan működik",
  howSub: "Három lépés, és egyetlen hívás sem vész el.",
  steps: [
    {
      title: "Irányítsd át a hívásokat",
      body: "Foglalt vagy, nem veszed fel, vagy nem vagy elérhető? A mobilod továbbítja a hívást Hannának. A saját számod marad, az átirányítás díját a mobilszolgáltatód számlázza.",
      code: "*61*06XXXXXXXXX#",
      codeNote: "példakód, szolgáltatónként eltér",
    },
    {
      title: "Hanna felveszi",
      body: "MI-asszisztensként mutatkozik be, a nevedben válaszol a jóváhagyott tudásod alapján, és időpontot foglal, ha ezt engedélyezed. Ha kell, élő munkatárshoz kapcsolja a hívót.",
      extra: "magyarul és angolul",
    },
    {
      title: "Te kész lépést kapsz",
      body: "Nem kell hangfelvételt visszahallgatnod. A dashboardon és e-mailben szándék, eredmény és következő lépés vár minden hívásról.",
      extra: "Szándék → Eredmény → Teendő",
    },
  ],
  verifyTitle: "Élesítés előtt ellenőrző hívás.",
  verifyBody: "Felhívjuk a számodat, te elutasítod, és megnézzük, hogy az átirányítás tényleg megérkezik Hannához.",
  getTitle: "Mit kapsz",
  getSub: "Nem hangfelvételt. Következő lépést.",
  tabsNote: "Minden hívás három sorban: mit akart a hívó, mi lett belőle, és mit kell neked tenni.",
  callLabel: "Hívás",
  afterDash: "Hívás után a dashboardon",
  testTitle: "Tesztelve élesítés előtt",
  testBody: "Mielőtt az első valódi ügyfél hív, Hanna már lement 20 próbahívást. Nyitvatartás, árak, időpontfoglalás, dühös hívó, angol hívó, telefonszám-diktálás.",
  testBody2: "Látod, mi ment át és mi nem, és csak akkor élesítesz, ha a pontszám kész. Minden publikált verzió elmentődik, így hiba esetén egy kattintással visszagörgetheted az előzőt.",
  scoreLabel: "Felkészültségi pontszám",
  scoreDetail: "19 forgatókönyv sikeres, 1 ellenőrzendő. Élesítés ajánlott 80 pont felett.",
  passLabel: "Sikeres",
  reviewLabel: "Ellenőrzendő",
  checks: [
    { name: "Nyitvatartás kérdés" },
    { name: "Árkérdés" },
    { name: "Időpontfoglalás és lemondás" },
    { name: "Ismeretlen kérdés" },
    { name: "Dühös hívó" },
    { name: "Angol nyelvű hívó" },
    { name: "Telefonszám diktálása", warn: true },
  ],
  learnTitle: "Tanuló rendszer",
  learnSub: "Amit nem tud, azt egyszer kell megválaszolnod.",
  learn: [
    {
      title: "Hanna nem tudja",
      body: "„Van parkoló a közelben?” Hanna nem találgat: visszahívást ajánl a hívónak, a kérdés pedig bekerül a tudásrés-listádba. Ezen a héten már 4 hívó kérdezte.",
    },
    {
      title: "Te válaszolsz egy mondatban",
      body: "„Igen, a hátsó udvarban 6 ingyenes hely van.” Begépeled vagy bemondod. Hanna szépen megfogalmazza, te jóváhagyod.",
    },
    {
      title: "Új verzió, újra tesztelve",
      body: "A következő hívó már választ kap. Az érintett próbahívás újrafut, és ha valami félresikerül, visszagörgetsz az előző verzióra.",
    },
  ],
  industriesTitle: "Kinek készült",
  industriesSub: "Ahol foglalt a kéz, a telefon se maradjon néma.",
  verticals: [
    {
      name: "Szépségszalon",
      pain: "Olló a kézben, vendég a székben. A csörgő telefon várhat, a hívó viszont nem.",
      does: "szabad időpontot ajánl, és beírja a naptárba.",
    },
    {
      name: "Autószerviz",
      pain: "Az autó az emelőn, a kéz olajos. Mire előkerülsz, a hívó már a következő műhelyt tárcsázza.",
      does: "megválaszolja az ár- és nyitvatartási kérdéseket, felveszi a hibaleírást.",
    },
    {
      name: "Szakipar",
      pain: "Létrán, fúró mellett, az ügyfélnél. A kiszállás közben érkező megrendelés is érték.",
      does: "felveszi a címet és a hiba leírását, a sürgőset megjelöli.",
    },
    {
      name: "Könyvelőiroda",
      pain: "Zárás előtti hajrá, határidők. Az ügyfél mégis választ vár.",
      does: "időpontot egyeztet, és üzenetet hagy a megfelelő kollégának.",
    },
  ],
  industriesNote: "Nem látod a szakmádat? A sablonok csak kiindulópontok, Hanna bármelyik vállalkozáshoz hozzáigazítható.",
  hannaDoes: "Hanna ilyenkor:",
  calcTitle: "Számold ki magad",
  calcSub: "Mennyit ér neked egy fel nem vett hívás? Add meg a saját becslésed.",
  calcDisclaimer: "Az eredmény nem ígéret és nem mért adat, csak számolás a te számaiddal. Ez bevétel, nem nyereség: az anyag- és munkaköltséged nincs benne.",
  calc: {
    calls: "Fel nem vett hívás hetente",
    callsUnit: (n) => `${n} db / hét`,
    share: "Ebből fizető megrendelés lett volna",
    avg: "Egy megrendelés átlagos értéke",
    revenue: "Becsült havi többletbevétel",
    orders: "Új megrendelés havonta",
    ordersUnit: "db",
    need: (plan) => `Ennyi új munka fedezi a Pro havidíjat (${plan}):`,
    needUnit: "db / hó",
    verdictOk: (orders, need) => `A saját becslésed szerint havonta ${orders} új megrendelés érkezne, a Pro havidíjához ${need} kell.`,
    verdictShort: (orders, need) => `A saját becslésed szerint a Pro havidíjához havonta ${need} megrendelés kellene, te ${orders}-et becsülsz.`,
    formula: "Számítás: heti hívás × 4,3 hét × fizető arány × átlagérték.",
  },
  pricingTitle: "Árak",
  pricingSub: "Átlátható árak, csendes leállás nélkül.",
  pricingNote: "A béta idején az árak változhatnak. Magyar adószám szükséges, egyéni vállalkozóként is előfizethetsz.",
  monthly: "Havi",
  annual: "Éves",
  annualDeal: "2 hónap ajándék",
  net: "Nettó",
  gross: "Bruttó (27% ÁFA)",
  grossNote: "bruttó",
  perMonth: "Ft / hó",
  perYear: "Ft / év",
  perMonthApprox: "Ft / hó",
  billedMonthly: "havi számlázás",
  plans: [
    {
      name: "Essential",
      tag: "Üzenetek és visszahívás",
      monthly: 19900,
      annual: 199000,
      minutes: "100 AI-perc / hó",
      noCalendar: true,
      feats: [
        "Tudásbázis, magyar és angol hívások",
        "Dashboard és e-mail minden hívásról",
        "Szándék → eredmény → következő lépés",
        "Hívásátadás élő munkatárshoz",
        "Tudásrés-napló és verziókezelés",
        "Tesztcsomag élesítés előtt",
      ],
      cta: "Essential kipróbálása",
    },
    {
      name: "Pro",
      tag: "A legtöbb vállalkozásnak",
      badge: "Legtöbbeknek",
      monthly: 34900,
      annual: 349000,
      minutes: "250 AI-perc / hó",
      feats: [
        "Minden az Essentialból",
        "Google Naptár: foglalás, lemondás, átfoglalás",
        "Nagyobb tudásbázis",
        "Részletes hívásriportok",
        "Hangválasztás",
        "Ellenőrző hívás az élesítés előtt",
      ],
      cta: "Pro kipróbálása",
    },
    {
      name: "Business",
      tag: "Több szám, több kolléga",
      monthly: 59900,
      annual: 599000,
      minutes: "500 AI-perc / hó",
      feats: [
        "Minden a Proból",
        "Akár 3 telefonszám / telephely",
        "3 felhasználó",
        "Segített beüzemelés",
        "Kiemelt támogatás",
      ],
      cta: "Business kipróbálása",
    },
  ],
  trialTitle: "Próba:",
  trialBody: "14 nap, bankkártya nélkül. 40 AI-percig valódi átirányítással is kipróbálhatod, plusz korlátlan böngészős teszthívás a beállítás alatt.",
  overageTitle: "Elfogyó perckeret:",
  overageBody: "75, 90 és 100%-nál jelzünk. Te döntesz: automatikus feltöltés, kisebb túlhasználat vagy leállás. Extra 100 perc: 9 900 Ft + ÁFA.",
  faqTitle: "GYIK",
  faqSub: "Amit ilyenkor mindenki megkérdez.",
  faq: [
    {
      q: "Embert hallok vagy gépet?",
      a: "Gépet. Hanna minden hívás legelső mondatában MI-asszisztensként mutatkozik be. Ez nem beállítás, hanem szabály.",
    },
    {
      q: "Mi van, ha olyat kérdeznek, amit nem tud?",
      a: "Nem találgat. Visszahívást ajánl, a kérdés pedig bekerül a tudásrés-listádba. Te egyszer megválaszolod, és Hanna a következő hívásnál már tudja.",
    },
    {
      q: "Mennyibe kerül az átirányítás?",
      a: "Az átirányított hívásszakaszt a saját mobilszolgáltatód számlázza a díjcsomagod szerint. A beállítási varázsló is kiírja.",
    },
    {
      q: "Rögzíti a hívásokat?",
      a: "Alapból nem. Ha te bekapcsolod, a hívó erről tájékoztatást kap a beszélgetés elején.",
    },
    {
      q: "Mi történik, ha elfogy a perckeret?",
      a: "75, 90 és 100%-nál jelzünk. Te döntöd el, mi legyen utána: automatikus feltöltés, kisebb túlhasználati díj vagy leállás. Csendben nem állunk le.",
    },
    {
      q: "Működik az én mobilszolgáltatómmal?",
      a: "A feltételes hívásátirányítást támogató Telekom, Yettel és One előfizetésekkel igen. Élesítés előtt ellenőrző hívással megnézzük, hogy a hívás tényleg megérkezik.",
    },
    {
      q: "Egyéni vállalkozóként is előfizethetek?",
      a: "Igen. Magyar adószám kell hozzá, más nem.",
    },
  ],
  finalTitle: "Hívd fel Hannát, és hallgasd meg, mit mondana az ügyfeleidnek.",
  finalSub: "14 nap, bankkártya nélkül.",
  footerDemo: "A Meta Global AI Developer Hackathonra készült demó. A példák kitalált vállalkozásokat és kitalált adatokat mutatnak.",
  footerRights: "Dial Hanna",
  privacy: "Adatvédelem",
  terms: "ÁSZF",
  contact: "Kapcsolat",
};

const en: LandingDict = {
  nav: {
    how: "How it works",
    get: "What you get",
    industries: "Industries",
    pricing: "Pricing",
    faq: "FAQ",
    signin: "Sign in",
    cta: "Try it free",
  },
  hero: {
    eyebrow: "AI call coverage for small businesses",
    titleA: "When you can't pick up,",
    titleB: "Hanna answers.",
    sub: "Keep your own number. When you're mid-job and can't answer the phone, Hanna picks up in your business's name in Hungarian or English, books appointments, and hands you a ready to-do — not a recording.",
    primary: "Try it free",
    secondary: "Call Hanna from your browser",
    trust: "14 days, no credit card · Hanna introduces herself as an AI assistant in the very first sentence of every call",
    panelCaption: "Forwarded call · 1:48",
    panelBiz: "Szalon Viola",
    afterTitle: "After the call",
    intent: "Intent",
    outcome: "Outcome",
    next: "Next step",
    demoNote: "Illustrative example with a fictional business.",
  },
  valuesTitle: "Why Hanna",
  values: [
    { title: "You keep your number", body: "No new number, no new app. You only switch on call forwarding." },
    { title: "Tested before going live", body: "20 scripted test calls and a visible readiness score before you go live." },
    { title: "She never guesses", body: "She only answers from your approved knowledge. If she doesn't know, she offers a callback." },
    { title: "The switch stays with you", body: "One click turns Hanna off, and calls ring only through to you again." },
  ],
  howTitle: "How it works",
  howSub: "Three steps, and not a single call is lost.",
  steps: [
    {
      title: "Forward your calls",
      body: "Busy, can't pick up, or unreachable? Your mobile forwards the call to Hanna. Your number stays yours; your carrier bills the forwarded leg per your plan.",
      code: "*61*06XXXXXXXXX#",
      codeNote: "example code, varies by carrier",
    },
    {
      title: "Hanna picks up",
      body: "She introduces herself as an AI assistant, answers in your name from your approved knowledge, and books appointments if you allow it. When needed, she hands the caller to a live colleague.",
      extra: "in Hungarian and English",
    },
    {
      title: "You get a ready next step",
      body: "No recordings to listen back to. Every call lands on your dashboard and in your inbox as intent, outcome, and next step.",
      extra: "Intent → Outcome → To-do",
    },
  ],
  verifyTitle: "A verification call before going live.",
  verifyBody: "We call your number, you decline, and we check that forwarding really reaches Hanna.",
  getTitle: "What you get",
  getSub: "Not a recording. A next step.",
  tabsNote: "Every call in three lines: what the caller wanted, what came of it, and what you need to do.",
  callLabel: "Call",
  afterDash: "On your dashboard after the call",
  testTitle: "Tested before going live",
  testBody: "Before the first real customer calls, Hanna has already run 20 test calls. Opening hours, prices, booking, an angry caller, an English-speaking caller, phone-number dictation.",
  testBody2: "You see what passed and what didn't, and you only go live when the score is ready. Every published version is saved, so one click rolls back if something goes wrong.",
  scoreLabel: "Readiness score",
  scoreDetail: "19 scenarios passed, 1 needs review. We recommend going live above 80.",
  passLabel: "Passed",
  reviewLabel: "Needs review",
  checks: [
    { name: "Opening-hours question" },
    { name: "Pricing question" },
    { name: "Booking and cancellation" },
    { name: "Unknown question" },
    { name: "Angry caller" },
    { name: "English-speaking caller" },
    { name: "Phone-number dictation", warn: true },
  ],
  learnTitle: "A system that learns",
  learnSub: "What she doesn't know, you answer exactly once.",
  learn: [
    {
      title: "Hanna doesn't know",
      body: "\u201CIs there parking nearby?\u201D Hanna doesn't guess: she offers the caller a callback, and the question lands on your knowledge-gap list. 4 callers asked it this week already.",
    },
    {
      title: "You answer in one sentence",
      body: "\u201CYes — 6 free spots in the back yard.\u201D You type or say it. Hanna phrases it nicely, you approve.",
    },
    {
      title: "New version, re-tested",
      body: "The next caller gets an answer. The affected test call re-runs, and if anything goes wrong you roll back to the previous version.",
    },
  ],
  industriesTitle: "Who it's for",
  industriesSub: "Where hands are busy, the phone shouldn't stay silent either.",
  verticals: [
    {
      name: "Beauty salon",
      pain: "Scissors in hand, a client in the chair. The ringing phone can wait — the caller can't.",
      does: "offers a free slot and writes it into the calendar.",
    },
    {
      name: "Auto repair",
      pain: "The car is on the lift, hands are oily. By the time you surface, the caller is dialling the next shop.",
      does: "answers price and opening-hour questions and takes the fault report.",
    },
    {
      name: "Trades & repairs",
      pain: "On a ladder, drill in hand, at the customer's. An order arriving mid-job is still money.",
      does: "takes the address and the fault description, and flags the urgent ones.",
    },
    {
      name: "Accounting office",
      pain: "Pre-closing rush, deadlines everywhere. The client still expects an answer.",
      does: "arranges an appointment and leaves a message for the right colleague.",
    },
  ],
  industriesNote: "Don't see your trade? The templates are just starting points — Hanna adapts to any business.",
  hannaDoes: "That's when Hanna:",
  calcTitle: "Do your own maths",
  calcSub: "What is one missed call worth to you? Enter your own estimates.",
  calcDisclaimer: "The result is not a promise and not measured data — just arithmetic with your numbers. This is revenue, not profit: material and labour costs aren't included.",
  calc: {
    calls: "Missed calls per week",
    callsUnit: (n) => `${n} / week`,
    share: "Share that would have become paying work",
    avg: "Average value of one job",
    revenue: "Estimated extra monthly revenue",
    orders: "New jobs per month",
    ordersUnit: "jobs",
    need: (plan) => `New jobs covering the Pro monthly fee (${plan}):`,
    needUnit: "jobs / mo",
    verdictOk: (orders, need) => `By your own estimate, ${orders} new jobs a month would arrive; the Pro fee needs ${need}.`,
    verdictShort: (orders, need) => `By your own estimate, the Pro fee would need ${need} jobs a month; you estimate ${orders}.`,
    formula: "Calculation: weekly calls × 4.3 weeks × paying share × average value.",
  },
  pricingTitle: "Pricing",
  pricingSub: "Clear prices, no silent shutdown.",
  pricingNote: "Prices may change during the beta. A Hungarian tax number is required; sole traders can subscribe too.",
  monthly: "Monthly",
  annual: "Annual",
  annualDeal: "2 months free",
  net: "Net",
  gross: "Gross (27% VAT)",
  grossNote: "gross",
  perMonth: "HUF / mo",
  perYear: "HUF / yr",
  perMonthApprox: "HUF / mo",
  billedMonthly: "billed monthly",
  plans: [
    {
      name: "Essential",
      tag: "Messages & callbacks",
      monthly: 19900,
      annual: 199000,
      minutes: "100 AI minutes / mo",
      noCalendar: true,
      feats: [
        "Knowledge base, Hungarian and English calls",
        "Dashboard and email for every call",
        "Intent → outcome → next step",
        "Live handover to a colleague",
        "Knowledge-gap log and versioning",
        "Test suite before going live",
      ],
      cta: "Try Essential",
    },
    {
      name: "Pro",
      tag: "For most businesses",
      badge: "Most popular",
      monthly: 34900,
      annual: 349000,
      minutes: "250 AI minutes / mo",
      feats: [
        "Everything in Essential",
        "Google Calendar: booking, cancellation, rescheduling",
        "Larger knowledge base",
        "Detailed call reports",
        "Voice selection",
        "Verification call before going live",
      ],
      cta: "Try Pro",
    },
    {
      name: "Business",
      tag: "More numbers, more colleagues",
      monthly: 59900,
      annual: 599000,
      minutes: "500 AI minutes / mo",
      feats: [
        "Everything in Pro",
        "Up to 3 phone numbers / sites",
        "3 users",
        "Assisted setup",
        "Priority support",
      ],
      cta: "Try Business",
    },
  ],
  trialTitle: "Trial:",
  trialBody: "14 days, no credit card. Try real forwarding up to 40 AI minutes, plus unlimited browser test calls during setup.",
  overageTitle: "Running out of minutes:",
  overageBody: "We alert you at 75, 90, and 100%. You decide: auto top-up, small overage, or stop. Extra 100 minutes: 9,900 HUF + VAT.",
  faqTitle: "FAQ",
  faqSub: "What everyone asks at this point.",
  faq: [
    {
      q: "Will I hear a human or a machine?",
      a: "A machine. Hanna introduces herself as an AI assistant in the very first sentence of every call. That's a rule, not a setting.",
    },
    {
      q: "What if they ask something she doesn't know?",
      a: "She doesn't guess. She offers a callback, and the question lands on your knowledge-gap list. You answer once, and she knows it from the next call.",
    },
    {
      q: "What does forwarding cost?",
      a: "Your own mobile carrier bills the forwarded leg according to your plan. The setup wizard shows this too.",
    },
    {
      q: "Does she record calls?",
      a: "Not by default. If you switch it on, the caller is informed at the start of the conversation.",
    },
    {
      q: "What happens when the minute quota runs out?",
      a: "We alert you at 75, 90, and 100%. You decide what happens next: auto top-up, a small overage fee, or stop. We never go silent.",
    },
    {
      q: "Does it work with my carrier?",
      a: "Yes, with Telekom, Yettel, and One subscriptions that support conditional call forwarding. A verification call checks the call really reaches Hanna before going live.",
    },
    {
      q: "Can I subscribe as a sole trader?",
      a: "Yes. You need a Hungarian tax number — nothing else.",
    },
  ],
  finalTitle: "Call Hanna and hear what she'd tell your customers.",
  finalSub: "14 days, no credit card.",
  footerDemo: "Built as a demo for the Meta Global AI Developer Hackathon. Examples show fictional businesses and fictional data.",
  footerRights: "Dial Hanna",
  privacy: "Privacy",
  terms: "Terms",
  contact: "Contact",
};

export const scenarios: Record<Lang, Scenario[]> = {
  hu: [
    {
      label: "Foglalás",
      biz: "Szalon Viola · szépségszalon",
      chip: "Lefoglalva",
      chipBg: "#3DDC97",
      chipFg: "#06301F",
      intent: "Időpontfoglalás",
      outcome: "Hajvágás, csütörtök 15:30",
      next: "Nincs teendő: az esemény a Google Naptárban van.",
      lines: [
        { who: "Hanna", text: "Szalon Viola, Hanna beszél, a szalon MI-asszisztense. Miben segíthetek?", hanna: true },
        { who: "Hívó", text: "Időpontot szeretnék hajvágásra, lehetőleg csütörtök délután.", hanna: false },
        { who: "Hanna", text: "Csütörtökön 15:30-kor van szabad hely. Foglaljam be?", hanna: true },
        { who: "Hívó", text: "Igen, Nagy Eszter vagyok.", hanna: false },
      ],
    },
    {
      label: "Új kérdés",
      biz: "Gyors Műhely · autószerviz",
      chip: "Tudásrés",
      chipBg: "#FFB62E",
      chipFg: "#0C1C20",
      intent: "Árkérdés és parkolás",
      outcome: "Megválaszolva, 1 kérdésre nem volt válasz",
      next: "Válaszolj egyszer a parkolásról, és Hanna legközelebb már tudja.",
      lines: [
        { who: "Hívó", text: "Mennyibe kerül egy fékbetétcsere egy Golfra?", hanna: false },
        { who: "Hanna", text: "Az első fékbetétcsere munkadíja 18 000 forinttól indul, az alkatrész ára a típustól függ.", hanna: true },
        { who: "Hívó", text: "És van náluk parkoló?", hanna: false },
        { who: "Hanna", text: "Erről most nincs biztos információm. Továbbítom a kérdést, és kérem, hagyja meg a számát, hogy visszahívhassák.", hanna: true },
      ],
    },
    {
      label: "Sürgős hívás",
      biz: "Hideg-Meleg Szerviz · szakipar",
      chip: "Sürgős",
      chipBg: "#F9DDD5",
      chipFg: "#8A2A12",
      intent: "Hibabejelentés",
      outcome: "Üzenet felvéve, sürgősként jelölve",
      next: "Hívd vissza ma 17:00 előtt: Kovács Anna.",
      lines: [
        { who: "Hívó", text: "Elfolyik a víz a mosdó alatt, ma ki tudnak jönni?", hanna: false },
        { who: "Hanna", text: "Sajnálom, hogy ez történt. Felírom az adatait, és sürgősként jelzem a szerelőnek. Mi a címe és a telefonszáma?", hanna: true },
        { who: "Hívó", text: "Kovács Anna vagyok, a Bartók Béla úton lakom.", hanna: false },
      ],
    },
  ],
  en: [
    {
      label: "Booking",
      biz: "Szalon Viola · beauty salon",
      chip: "Booked",
      chipBg: "#3DDC97",
      chipFg: "#06301F",
      intent: "Appointment booking",
      outcome: "Haircut, Thursday 3:30 PM",
      next: "Nothing to do: the event is in Google Calendar.",
      lines: [
        { who: "Hanna", text: "Szalon Viola, this is Hanna, the salon's AI assistant. How can I help?", hanna: true },
        { who: "Caller", text: "I'd like a haircut appointment, preferably Thursday afternoon.", hanna: false },
        { who: "Hanna", text: "Thursday at 3:30 PM is free. Shall I book it?", hanna: true },
        { who: "Caller", text: "Yes — I'm Jane Smith.", hanna: false },
      ],
    },
    {
      label: "New question",
      biz: "Gyors Műhely · auto repair",
      chip: "Knowledge gap",
      chipBg: "#FFB62E",
      chipFg: "#0C1C20",
      intent: "Pricing and parking",
      outcome: "Answered, 1 question had no answer",
      next: "Answer once about parking, and Hanna will know next time.",
      lines: [
        { who: "Caller", text: "How much is a brake pad change for a Golf?", hanna: false },
        { who: "Hanna", text: "Front brake pad labour starts at 18,000 forints; parts depend on the model.", hanna: true },
        { who: "Caller", text: "And do you have parking?", hanna: false },
        { who: "Hanna", text: "I don't have reliable information on that. I'll pass the question on — please leave your number so they can call you back.", hanna: true },
      ],
    },
    {
      label: "Urgent call",
      biz: "Hideg-Meleg Szerviz · trades",
      chip: "Urgent",
      chipBg: "#F9DDD5",
      chipFg: "#8A2A12",
      intent: "Fault report",
      outcome: "Message taken, flagged as urgent",
      next: "Call back before 5:00 PM today: Kovács Anna.",
      lines: [
        { who: "Caller", text: "Water is leaking under the sink — can someone come today?", hanna: false },
        { who: "Hanna", text: "I'm sorry to hear that. I'll take your details and flag it as urgent with the technician. What's your address and phone number?", hanna: true },
        { who: "Caller", text: "I'm Kovács Anna, I live on Bartók Béla Street.", hanna: false },
      ],
    },
  ],
};

export const TRIAL_LINK =
  "mailto:hello@dialhanna.com?subject=Dial%20Hanna%20trial";

export const landing: Record<Lang, LandingDict> = { hu, en };
