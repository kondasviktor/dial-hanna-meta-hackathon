// Bilingual landing copy (HU + EN). Fictional demo businesses on the marketing
// page only; the live dashboard never invents shop data.

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
  ownerTitle: string;
  ownerSub: string;
  ownerTiles: { title: string; body: string }[];
  versionsBand: string;
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
  footerCraftPrefix: string;
  footerCraftLink: string;
  footerRights: string;
  footerStatus: string;
  privacy: string;
  terms: string;
  contact: string;
  waitlistTitle: string;
  waitlistBody: string;
  waitlistSubmit: string;
  waitlistSuccess: string;
  waitlistPlaceholder: string;
}

const hu: LandingDict = {
  nav: {
    how: "Hogyan működik",
    get: "Mit kapsz",
    industries: "Ágazatok",
    pricing: "Árak",
    faq: "GYIK",
    signin: "Belépés",
    cta: "Várólista",
  },
  hero: {
    eyebrow: "MI-alapú híváslefedés kisvállalkozásoknak",
    titleA: "Ha nem érsz rá,",
    titleB: "Hanna felveszi.",
    sub: "Tartsd meg a saját számodat. Amikor munka közben nem tudod felvenni a telefont, Hanna a vállalkozásod nevében magyarul vagy angolul fogadja a hívást, időpontot foglal, és kész teendőt ad át — nem hangfelvételt.",
    primary: "Csatlakozom a várólistához",
    secondary: "Nézd meg, hogyan működik",
    trust: "Induláskor 7 nap próba a saját számodon · Hanna minden hívás első mondatában MI-asszisztensként mutatkozik be",
    panelCaption: "Hívás · 1:48",
    panelBiz: "Szalon Viola · szépségszalon",
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
  ownerTitle: "Te irányítod Hannát",
  ownerSub: "Mit mondhat, kit hogyan kezel, és hogyan tanul egyetlen válaszból.",
  ownerTiles: [
    {
      title: "Csak jóváhagyott tudás",
      body: "Amit nem mondtál meg, azt nem állítja. Ismeretlen kérdésnél visszahívást ajánl.",
    },
    {
      title: "Ismerősöket nem faggat",
      body: "Mentett számoktól csak rövid üzenetet vesz fel, és kiemelten jelzi neked.",
    },
    {
      title: "Egy kapcsoló",
      body: "Kikapcsolod — Hanna szünetel. Az átirányítást nem kell bontanod.",
    },
    {
      title: "Amit nem tud, feljegyzi",
      body: "Összetett kérdésnél nem találgat: a kérdés a pótolandó listádra kerül.",
    },
    {
      title: "Egyszer válaszolsz",
      body: "Egy mondat elég. Hanna megfogalmazza, te jóváhagyod.",
    },
    {
      title: "Következő hívó már tudja",
      body: "Élőbe kerül. Ha félresikerül, egy kattintással visszalépsz.",
    },
  ],
  versionsBand: "Ha valami félresikerül, egy kattintással visszalépsz az előző verzióra.",
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
      slug: "vendeglatas",
      name: "Vendéglátás",
      pain: "Tele a terem, a konyha pörög. A telefon asztalfoglalást vagy tortarendelést hozna — ha felvennéd.",
      does: "felveszi az asztal- vagy tortarendelést, és megválaszolja a nyitvatartási kérdéseket.",
    },
    {
      slug: "virag-ajandek",
      name: "Virág és ajándék",
      pain: "Szezonban a pultnál állsz, a telefon közben csörög. Aki nem ér el, máshol rendel.",
      does: "felveszi a rendelést, az átvétel idejét és a címzett adatait.",
    },
    {
      slug: "nyelviskola-magantanar",
      name: "Nyelviskola és magántanár",
      pain: "Órán vagy, a telefon a táskában. Az új diák addig dönt, amíg visszahívod.",
      does: "próbaórát egyeztet, és megválaszolja az órarendi kérdéseket.",
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
    formula: "A havi becslés a heti számaidból készül (heti hívás × 4 × fizető arány × átlagérték).",
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
        "Hiányzó válaszok naplója és verziókezelés",
        "Ellenőrző hívás az élesítés előtt",
      ],
      cta: "Várólista · Essential",
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
      cta: "Várólista · Pro",
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
      cta: "Várólista · Business",
    },
  ],
  trialTitle: "Induláskor:",
  trialBody: "A fizetős csomagok megnyitásakor 7 nap próba a saját számodon, bankkártyával. Most a várólistára lehet feliratkozni.",
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
      a: "Nem találgat. Visszahívást ajánl, a kérdés pedig a pótolandó listádra kerül. Egyszer megválaszolod, és Hanna a következő hívásnál már tudja.",
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
  finalTitle: "Ne veszíts el több ügyfélhívást.",
  finalSub: "Írd fel magad a várólistára. A 7 napos próba a saját számodon a fizetős csomagok indulásakor nyílik meg.",
  footerCraftPrefix: "Crafted by Viktor @ ",
  footerCraftLink: "Vibe Coder's Life",
  footerRights: "© 2026 Dial Hanna. All rights reserved.",
  footerStatus: "Státusz",
  privacy: "Adatvédelem",
  terms: "ÁSZF",
  contact: "Kapcsolat",
  waitlistTitle: "Várólista",
  waitlistBody: "A Dial Hanna most várólistás. Nincs nyilvános próba és nincs böngészős hívás. Amikor a fizetős csomagok elindulnak, megírjuk, és 7 napig a saját számodon próbálhatod.",
  waitlistSubmit: "Feliratkozom",
  waitlistSuccess: "Kész. Megírjuk, amikor indulunk.",
  waitlistPlaceholder: "email@vallalkozas.hu",
};

const en: LandingDict = {
  nav: {
    how: "How it works",
    get: "What you get",
    industries: "Industries",
    pricing: "Pricing",
    faq: "FAQ",
    signin: "Sign in",
    cta: "Join waitlist",
  },
  hero: {
    eyebrow: "AI call coverage for small businesses",
    titleA: "When you can't pick up,",
    titleB: "Hanna answers.",
    sub: "Keep your own number. When you're mid-job and can't answer the phone, Hanna picks up in your business's name in Hungarian or English, books appointments, and hands you a ready to-do — not a recording.",
    primary: "Join the waitlist",
    secondary: "See how it works",
    trust: "At launch: 7-day trial on your own number · Hanna introduces herself as an AI assistant in the first sentence of every call",
    panelCaption: "Call · 1:48",
    panelBiz: "Szalon Viola · beauty salon",
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
  ownerTitle: "You're in control of Hanna",
  ownerSub: "What she may say, how she treats callers, and how she learns from one answer.",
  ownerTiles: [
    {
      title: "Approved knowledge only",
      body: "What you never told her, she never claims. On unknowns she offers a callback.",
    },
    {
      title: "Light touch for known contacts",
      body: "Saved numbers get a short message only — flagged for you, no interview.",
    },
    {
      title: "One switch",
      body: "Turn her off and Hanna pauses. You don't need to cancel forwarding.",
    },
    {
      title: "Unknowns get logged",
      body: "On a complex question she doesn't guess — it lands on your to-answer list.",
    },
    {
      title: "You answer once",
      body: "One sentence is enough. Hanna phrases it; you approve.",
    },
    {
      title: "Next caller already knows",
      body: "It goes live. If something goes wrong, one click rolls back.",
    },
  ],
  versionsBand: "If something goes wrong, one click rolls back to the previous version.",
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
      slug: "vendeglatas",
      name: "Hospitality",
      pain: "The floor is full, the kitchen is flying. The phone would bring a table booking or a cake order — if you could pick up.",
      does: "takes the table or cake order and answers opening-hour questions.",
    },
    {
      slug: "virag-ajandek",
      name: "Flowers & gifts",
      pain: "You're at the counter in peak season while the phone rings. Whoever can't reach you orders elsewhere.",
      does: "takes the order, the pickup time and the recipient details.",
    },
    {
      slug: "nyelviskola-magantanar",
      name: "Language schools & tutors",
      pain: "You're in a lesson, phone in the bag. The new student decides before you can call back.",
      does: "arranges a trial lesson and answers timetable questions.",
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
    formula: "The monthly estimate comes from your weekly figures (weekly calls × 4 × paying share × average value).",
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
      cta: "Waitlist · Essential",
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
      cta: "Waitlist · Pro",
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
      cta: "Waitlist · Business",
    },
  ],
  trialTitle: "At launch:",
  trialBody: "When paid plans open, you get a 7-day trial on your own number with a card on file. Right now you can join the waitlist.",
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
      a: "She doesn't guess. She offers a callback, and the question lands on your to-answer list. You answer once, and she knows it from the next call.",
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
  finalTitle: "Stop losing customer calls.",
  finalSub: "Join the waitlist. The 7-day trial on your own number opens when paid plans launch.",
  footerCraftPrefix: "Crafted by Viktor @ ",
  footerCraftLink: "Vibe Coder's Life",
  footerRights: "© 2026 Dial Hanna. All rights reserved.",
  footerStatus: "Status",
  privacy: "Privacy",
  terms: "Terms",
  contact: "Contact",
  waitlistTitle: "Join the waitlist",
  waitlistBody: "Dial Hanna is waitlist-only for now. There is no public trial and no call-from-the-website. When paid plans open, we email you — then you can try 7 days on your own number.",
  waitlistSubmit: "Join the waitlist",
  waitlistSuccess: "You're on the list. We'll email you when we open.",
  waitlistPlaceholder: "you@business.com",
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
        { who: "Hanna", text: "Csütörtökön 15:30-kor van szabad hely. Foglaljam?", hanna: true },
        { who: "Hívó", text: "Igen, Nagy Eszter vagyok.", hanna: false },
      ],
    },
    {
      label: "Kérdés",
      biz: "Gyors Műhely · autószerviz",
      chip: "Hiányzó válasz",
      chipBg: "#FFB62E",
      chipFg: "#0C1C20",
      intent: "Árkérdés és biztosítás",
      outcome: "Megválaszolva, 1 kérdésre nem volt válasz",
      next: "Válaszolj egyszer a biztosítós számlázásról — Hanna legközelebb már tudja.",
      lines: [
        { who: "Hívó", text: "Mennyibe kerül egy első lökhárítócsere egy Golfra?", hanna: false },
        { who: "Hanna", text: "Az első lökhárítócsere munkadíja 65 000 forinttól indul, az alkatrész és a fényezés a típustól függ.", hanna: true },
        { who: "Hívó", text: "A Generali casco fizetné — tudnak közvetlenül a biztosítónak számlázni, és ők intézik az ügyintézést?", hanna: false },
        { who: "Hanna", text: "Erről most nincs biztos információm. Továbbítom a kérdést, és kérem, hagyja meg a számát, hogy visszahívhassák.", hanna: true },
      ],
    },
    {
      label: "Sürgős",
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
        { who: "Hanna", text: "Thursday at 3:30 PM is free. Shall I book?", hanna: true },
        { who: "Caller", text: "Yes — I'm Jane Smith.", hanna: false },
      ],
    },
    {
      label: "Question",
      biz: "Gyors Műhely · auto repair",
      chip: "Unanswered",
      chipBg: "#FFB62E",
      chipFg: "#0C1C20",
      intent: "Pricing and insurance",
      outcome: "Answered, 1 question had no answer",
      next: "Answer once about insurer billing — Hanna will know next time.",
      lines: [
        { who: "Caller", text: "How much is a front bumper replacement for a Golf?", hanna: false },
        { who: "Hanna", text: "Front bumper replacement labour starts at 65,000 forints; parts and paint depend on the model.", hanna: true },
        { who: "Caller", text: "Generali casco would cover it — can you invoice the insurer directly and handle the paperwork?", hanna: false },
        { who: "Hanna", text: "I don't have reliable information on that. I'll pass the question on — please leave your number so they can call you back.", hanna: true },
      ],
    },
    {
      label: "Urgent",
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

export function waitlistHref(lang: Lang, plan?: string): string {
  const q = new URLSearchParams();
  if (lang === "en") q.set("lang", "en");
  if (plan) q.set("plan", plan.toLowerCase());
  const s = q.toString();
  return s ? `/waitlist?${s}` : "/waitlist";
}

export const landing: Record<Lang, LandingDict> = { hu, en };
