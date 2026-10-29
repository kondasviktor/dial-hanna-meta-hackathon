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

export interface Vertical {
  slug: string;
  name: string;
  pain: string;
  does: string;
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
  controlTitle: string;
  controlSub: string;
  controls: { title: string; body: string }[];
  versionsBand: string;
  learnTitle: string;
  learnSub: string;
  learn: { title: string; body: string }[];
  industriesTitle: string;
  industriesSub: string;
  verticals: Vertical[];
  industriesNote: string;
  bespokeTitle: string;
  bespokeBody: string;
  bespokeCta: string;
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
    secondary: "Nézd meg, hogyan működik",
    trust: "14 nap, bankkártya nélkül · Hanna minden hívás első mondatában MI-asszisztensként mutatkozik be",
    panelCaption: "Átirányított hívás · 1:48",
    panelBiz: "Szalon Viola",
    afterTitle: "Hívás után",
    intent: "Szándék",
    outcome: "Eredmény",
    next: "Következő lépés",
    demoNote: "Mintabeszélgetés.",
  },
  valuesTitle: "Miért Hanna",
  values: [
    { title: "Megtartod a számodat", body: "Nincs új szám, nincs új app. Csak az átirányítást kapcsolod be." },
    { title: "Élesítés előtt ellenőrző hívás", body: "Felhívjuk a számodat, te elutasítod, és megnézzük, hogy az átirányítás tényleg megérkezik Hannához." },
    { title: "Nem találgat", body: "Csak a jóváhagyott tudásodból válaszol. Ha nem tudja, visszahívást ajánl." },
    { title: "A kapcsoló nálad van", body: "Egy kattintással Hanna szünetel, az átirányítást nem kell bontanod." },
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
  controlTitle: "Te szabod meg, mit mondhat",
  controlSub: "És kit hogyan kezeljen.",
  controls: [
    { title: "Csak jóváhagyott tudásból válaszol", body: "Amit nem mondtál meg neki, azt nem állítja. Ismeretlen kérdésnél visszahívást ajánl, és beírja a tudásrés-listádba." },
    { title: "Ismerősöket nem faggat", body: "A mentett számoktól nem kérdez, csak rövid üzenetet vesz fel, és kiemelten jelzi neked." },
    { title: "Egy kapcsoló", body: "Kikapcsolod, és Hanna szünetel. Az átirányítást nem kell bontanod, visszakapcsoláskor azonnal fogad." },
    { title: "Rögzítés alapból kikapcsolva", body: "Ha bekapcsolod, a hívó a beszélgetés elején erről tájékoztatást kap." },
  ],
  versionsBand: "Ha valami félresikerül, egy kattintással visszalépsz az előző verzióra.",
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
      title: "Új verzió élőben",
      body: "A következő hívó már választ kap. Ha valami félresikerül, visszagörgetsz az előző verzióra.",
    },
  ],
  industriesTitle: "Kinek készült",
  industriesSub: "Ahol foglalt a kéz, a telefon se maradjon néma.",
  verticals: [
    {
      slug: "hajszalon",
      name: "Hajszalon és szépségszalon",
      pain: "Olló a kézben, vendég a székben. A csörgő telefon várhat, a hívó viszont nem.",
      does: "szabad időpontot ajánl, és beírja a naptárba.",
    },
    {
      slug: "auto-gumiszerviz",
      name: "Autó- és gumiszerviz",
      pain: "Az autó az emelőn, a kéz olajos. Mire előkerülsz, a hívó már a következő műhelyt tárcsázza.",
      does: "megválaszolja az ár- és nyitvatartási kérdéseket, felveszi a hibaleírást.",
    },
    {
      slug: "szakipar",
      name: "Szakipar és ezermester",
      pain: "Létrán, fúró mellett, az ügyfélnél. A kiszállás közben érkező megrendelés is érték.",
      does: "felveszi a címet és a hiba leírását, a sürgőset megjelöli.",
    },
    {
      slug: "koltoztetes-takaritas",
      name: "Költöztetés és takarítás",
      pain: "Rakodás közben nem érsz rá telefonálni. Aki nem ér el, mást hív.",
      does: "felveszi a dátumot, a címet és a lakás méretét, és strukturált ajánlatkérést ad át.",
    },
    {
      slug: "panzio-apartman",
      name: "Panzió és apartman",
      pain: "Takarítás, kulcsátadás, vendég a kapuban. A foglalási kérdés nem várhat.",
      does: "felveszi a foglalási kérést üzenetként, és azonnal jelzi neked.",
    },
    {
      slug: "edzok-studiok",
      name: "Edzők és stúdiók",
      pain: "Edzés közben nincs telefon a kézben. Az új bérletes addig dönt, amíg eléred.",
      does: "időpontot egyeztet próbórára, és megválaszolja az órarendi kérdéseket.",
    },
    {
      slug: "fotos-rendezveny",
      name: "Fotós és rendezvény",
      pain: "Esküvőn fotózol, nem telefonálsz. A jövő évi naptárad ekkor telik meg.",
      does: "felveszi a dátumot és a helyszínt, a szabad dátumra visszahívást kér.",
    },
    {
      slug: "kutya-kozmetika",
      name: "Kutyakozmetika",
      pain: "Vizes kéz, ugató vendég az asztalon. A gazdi közben kétszer is hív.",
      does: "időpontot foglal, és felveszi a kutya fajtáját meg a kért szolgáltatást.",
    },
    {
      slug: "szabaduszok-maganszemelyek",
      name: "Szabadúszók és magánszemélyek",
      pain: "Megbeszélésen vagy fókuszban, a telefon némítva. A lehetőség nem vár.",
      does: "felveszi, ki hívott és miért, és üzenetként átadja.",
    },
  ],
  industriesNote: "Nem látod a szakmádat? A sablonok csak kiindulópontok, Hanna bármelyik vállalkozáshoz hozzáigazítható.",
  bespokeTitle: "Egyedi folyamatra van szükséged?",
  bespokeBody: "Ha a vállalkozásod menete eltér a szokásostól — saját rendszer, külön értesítések, speciális foglalási szabályok — írd meg, és összekötjük Hannát a te eszközeiddel.",
  bespokeCta: "Egyedi igény jelzése",
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
  pricingNote: "A béta idején az árak változhatnak. Az árak végösszegek: alanyi adómentes vállalkozásként ÁFÁt nem számítunk fel. Egyéni vállalkozóként és magánszemélyként is előfizethetsz.",
  monthly: "Havi",
  annual: "Éves",
  annualDeal: "2 hónap ajándék",
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
        "Ellenőrző hívás az élesítés előtt",
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
  trialBody: "14 nap, bankkártya nélkül, 40 AI-perccel valódi átirányított hívásokra.",
  overageTitle: "Elfogyó perckeret:",
  overageBody: "75, 90 és 100%-nál jelzünk. Te döntesz: automatikus feltöltés, kisebb túlhasználat vagy leállás. Extra 100 perc: 9 900 Ft.",
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
      q: "Egyéni vállalkozóként vagy magánszemélyként is előfizethetek?",
      a: "Igen. Magyar adószám nem kell hozzá, más feltétel nincs.",
    },
  ],
  finalTitle: "Hívd fel Hannát, és hallgasd meg, mit mondana az ügyfeleidnek.",
  finalSub: "14 nap, bankkártya nélkül.",
  footerDemo: "A Meta Global AI Developer Hackathonra készült.",
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
    secondary: "See how it works",
    trust: "14 days, no credit card · Hanna introduces herself as an AI assistant in the very first sentence of every call",
    panelCaption: "Forwarded call · 1:48",
    panelBiz: "Szalon Viola",
    afterTitle: "After the call",
    intent: "Intent",
    outcome: "Outcome",
    next: "Next step",
    demoNote: "Sample conversation.",
  },
  valuesTitle: "Why Hanna",
  values: [
    { title: "You keep your number", body: "No new number, no new app. You only switch on call forwarding." },
    { title: "A verification call before going live", body: "We call your number, you decline, and we check that forwarding really reaches Hanna." },
    { title: "She never guesses", body: "She only answers from your approved knowledge. If she doesn't know, she offers a callback." },
    { title: "The switch stays with you", body: "One click pauses Hanna; you don't need to cancel the forwarding." },
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
  controlTitle: "You decide what she may say",
  controlSub: "And how she treats whom.",
  controls: [
    { title: "Only approved knowledge", body: "What you never told her, she never claims. On unknown questions she offers a callback and logs a knowledge gap." },
    { title: "Light touch for known contacts", body: "Saved numbers get no interview — just a short message, flagged for you." },
    { title: "One switch", body: "Switch her off and Hanna pauses. You don't need to cancel the forwarding; she answers again right after you switch her back on." },
    { title: "Recording off by default", body: "If you switch it on, the caller is informed at the start of the conversation." },
  ],
  versionsBand: "If something goes wrong, one click rolls back to the previous version.",
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
      title: "New version live",
      body: "The next caller gets an answer. If anything goes wrong, you roll back to the previous version.",
    },
  ],
  industriesTitle: "Who it's for",
  industriesSub: "Where hands are busy, the phone shouldn't stay silent either.",
  verticals: [
    {
      slug: "hajszalon",
      name: "Salon & beauty",
      pain: "Scissors in hand, a client in the chair. The ringing phone can wait — the caller can't.",
      does: "offers a free slot and writes it into the calendar.",
    },
    {
      slug: "auto-gumiszerviz",
      name: "Auto & tyre service",
      pain: "The car is on the lift, hands are oily. By the time you surface, the caller is dialling the next shop.",
      does: "answers price and opening-hour questions and takes the fault report.",
    },
    {
      slug: "szakipar",
      name: "Trades & handymen",
      pain: "On a ladder, drill in hand, at the customer's. An order arriving mid-job is still money.",
      does: "takes the address and the fault description, and flags the urgent ones.",
    },
    {
      slug: "koltoztetes-takaritas",
      name: "Moving & cleaning",
      pain: "Mid-move, you can't pick up the phone. Whoever can't reach you calls someone else.",
      does: "takes the date, address and flat size as a structured quote request.",
    },
    {
      slug: "panzio-apartman",
      name: "Guesthouses & apartments",
      pain: "Cleaning, key handover, a guest at the gate. Booking questions can't wait.",
      does: "takes the booking request as a message and flags it to you at once.",
    },
    {
      slug: "edzok-studiok",
      name: "Trainers & studios",
      pain: "Mid-session, there's no phone in hand. The new member decides while you can still reach them.",
      does: "arranges trial sessions and answers timetable questions.",
    },
    {
      slug: "fotos-rendezveny",
      name: "Photographers & events",
      pain: "You're shooting a wedding, not answering calls. Next year's calendar fills up right now.",
      does: "takes the date and venue, and asks for a callback on free dates.",
    },
    {
      slug: "kutya-kozmetika",
      name: "Pet grooming",
      pain: "Wet hands, a barking client on the table. The owner calls twice in the meantime.",
      does: "books the appointment and takes the breed plus the requested service.",
    },
    {
      slug: "szabaduszok-maganszemelyek",
      name: "Freelancers & private persons",
      pain: "In a meeting or in focus, phone on silent. The opportunity won't wait.",
      does: "takes who called and why, and hands it over as a message.",
    },
  ],
  industriesNote: "Don't see your trade? The templates are just starting points — Hanna adapts to any business.",
  bespokeTitle: "Need a bespoke process?",
  bespokeBody: "If your business runs differently — your own systems, special notifications, custom booking rules — tell us and we'll connect Hanna to your tools.",
  bespokeCta: "Request a bespoke setup",
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
  pricingNote: "Prices may change during the beta. Prices are final: as a VAT-exempt operator we charge no VAT. Sole traders and private persons may subscribe.",
  monthly: "Monthly",
  annual: "Annual",
  annualDeal: "2 months free",
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
        "Verification call before going live",
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
  trialBody: "14 days, no credit card, 40 AI minutes in total for real forwarded calls.",
  overageTitle: "Running out of minutes:",
  overageBody: "We alert you at 75, 90, and 100%. You decide: auto top-up, small overage, or stop. Extra 100 minutes: 9,900 HUF.",
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
      q: "Can I subscribe as a sole trader or a private person?",
      a: "Yes. No Hungarian tax number is needed — nothing else is required either.",
    },
  ],
  finalTitle: "Call Hanna and hear what she'd tell your customers.",
  finalSub: "14 days, no credit card.",
  footerDemo: "Built for the Meta Global AI Developer Hackathon.",
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
