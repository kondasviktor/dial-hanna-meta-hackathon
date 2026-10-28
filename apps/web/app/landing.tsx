"use client";

import { useState } from "react";

const INK = "#0C1C20";
const PANEL = "#0E2A30";
const AMBER = "#FFB62E";
const GREEN = "#3DDC97";

interface Scenario {
  label: string;
  biz: string;
  chip: string;
  chipBg: string;
  chipFg: string;
  intent: string;
  outcome: string;
  next: string;
  lines: [string, string][];
}

const SCENARIOS: Scenario[] = [
  {
    label: "Foglalás", biz: "Rózsa Szépségszalon · szépségszalon",
    chip: "Lefoglalva", chipBg: GREEN, chipFg: "#06301F",
    intent: "Időpontfoglalás", outcome: "Női hajvágás, péntek 14:30",
    next: "Nincs teendő: az esemény a Google Naptárban van.",
    lines: [
      ["Hanna", "Jó napot kívánok, a Rózsa Szépségszalon vonalán Hanna beszél, a vállalkozás mesterséges intelligencia alapú asszisztense. Miben segíthetek?"],
      ["Hívó", "Péntek délutánra szeretnék női hajvágásra időpontot."],
      ["Hanna", "Egy pillanat, megnézem. Pénteken 14:30-kor van szabad hely. Foglaljam be?"],
      ["Hívó", "Igen. Kovács Anna vagyok."],
    ],
  },
  {
    label: "Új kérdés", biz: "Kovács Autószerviz · autószerviz",
    chip: "Tudásrés", chipBg: AMBER, chipFg: INK,
    intent: "Árkérdés és parkolás", outcome: "Megválaszolva, 1 kérdésre nem volt válasz",
    next: "Válaszolj egyszer a parkolásról, és Hanna legközelebb már tudja.",
    lines: [
      ["Hanna", "Jó napot kívánok, a Kovács Autószerviz vonalán Hanna beszél, a vállalkozás mesterséges intelligencia alapú asszisztense. Miben segíthetek?"],
      ["Hívó", "Mennyibe kerül egy fékbetétcsere?"],
      ["Hanna", "Az első fékbetétcsere munkadíja 25 000 forinttól indul, az alkatrész ára a típustól függ."],
      ["Hívó", "És van náluk parkoló?"],
      ["Hanna", "Erről most nincs biztos információm. Továbbítom a kérdést, és kérem, hagyja meg a számát, hogy visszahívhassák."],
    ],
  },
  {
    label: "Sürgős hívás", biz: "Hideg-Meleg Szerviz · szakipar",
    chip: "Sürgős", chipBg: "#F9DDD5", chipFg: "#8A2A12",
    intent: "Hibabejelentés", outcome: "Üzenet felvéve, sürgősként jelölve",
    next: "Hívd vissza ma 17:00 előtt: Kovács Anna.",
    lines: [
      ["Hanna", "Jó napot kívánok, a vállalkozás vonalán Hanna beszél, a vállalkozás mesterséges intelligencia alapú asszisztense. Miben segíthetek?"],
      ["Hívó", "Elfolyik a víz a mosdó alatt, ma ki tudnak jönni?"],
      ["Hanna", "Sajnálom, hogy ez történt. Felírom az adatait, és sürgősként jelzem a szerelőnek. Mi a címe és a telefonszáma?"],
      ["Hívó", "Kovács Anna vagyok, a Bartók Béla úton lakom."],
    ],
  },
];

export function CallTabs() {
  const [tab, setTab] = useState(0);
  const sc = SCENARIOS[tab];
  return (
    <div style={{ background: PANEL, color: "#fff", borderRadius: 12, padding: 24 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {SCENARIOS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setTab(i)}
            style={{
              background: tab === i ? INK : "transparent", color: "#fff",
              border: "1px solid #ffffff44", borderRadius: 6, padding: "8px 14px", cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "#D6E4E6", margin: "0 0 4px" }}>{sc.biz}</p>
      <p style={{ margin: "0 0 12px" }}>
        <span style={{ background: sc.chipBg, color: sc.chipFg, borderRadius: 4, padding: "2px 8px", fontSize: 13 }}>
          {sc.chip}
        </span>
      </p>
      {sc.lines.map(([who, text], i) => (
        <p key={i} style={{ margin: "0 0 8px", fontSize: 15 }}>
          <strong style={{ color: who === "Hanna" ? AMBER : "#fff" }}>{who}:</strong> {text}
        </p>
      ))}
      <p className="mono" style={{ fontSize: 13, color: "#D6E4E6", margin: "16px 0 0" }}>
        {sc.intent} → {sc.outcome} · {sc.next}
      </p>
    </div>
  );
}

const PLANS = [
  { tag: "Üzenetek és visszahívás", m: 19900, y: 199000, feats: ["Tudásbázis, magyar és angol hívások", "Dashboard és e-mail minden hívásról", "Szándék → eredmény → következő lépés", "Hívásátadás élő munkatárshoz", "Tudásrés-napló és verziókezelés", "Tesztcsomag élesítés előtt"] },
  { tag: "A legtöbb vállalkozásnak", m: 34900, y: 349000, feats: ["Minden az Essentialból", "Google Naptár: foglalás, lemondás, átfoglalás", "Nagyobb tudásbázis", "Részletes hívásriportok", "Ellenőrző hívás az élesítés előtt"] },
  { tag: "Több szám, több kolléga", m: 59900, y: 599000, feats: ["Minden a Proból", "Akár 3 telefonszám / telephely", "3 felhasználó", "Segített beüzemelés", "Kiemelt támogatás"] },
];

const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [gross, setGross] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={() => setAnnual(false)} style={toggle(!annual)}>Havi</button>
        <button onClick={() => setAnnual(true)} style={toggle(annual)}>Éves</button>
        <span style={{ width: 16 }} />
        <button onClick={() => setGross(false)} style={toggle(!gross)}>Nettó</button>
        <button onClick={() => setGross(true)} style={toggle(gross)}>Bruttó</button>
      </div>
      {PLANS.map((p) => {
        const base = annual ? p.y : p.m;
        const v = gross ? base * 1.27 : base;
        return (
          <div key={p.tag} style={{ borderTop: "1px solid #D8DDD6", padding: "16px 0" }}>
            <strong>{p.tag}</strong>
            <p style={{ fontSize: 22, margin: "4px 0" }}>
              {fmt(v)} Ft / {annual ? "év" : "hó"}{" "}
              <span style={{ fontSize: 13, color: "#3E5157" }}>{gross ? "bruttó" : "+ ÁFA"}</span>
            </p>
            {annual && <p style={{ fontSize: 13, color: "#3E5157", margin: 0 }}>≈ {fmt(v / 12)} Ft / hó · éves számlázás</p>}
            <ul style={{ paddingLeft: 20, margin: "8px 0 0" }}>
              {p.feats.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        );
      })}
      <p style={{ fontSize: 13, color: "#3E5157" }}>Feltöltés: 9 900 Ft / 100 perc. 14 nap próba, bankkártya nélkül.</p>
    </div>
  );
}

function toggle(on: boolean): React.CSSProperties {
  return {
    background: on ? INK : "transparent", color: on ? "#fff" : INK,
    border: `1px solid ${INK}`, borderRadius: 6, padding: "6px 14px", cursor: "pointer",
  };
}

const QA: [string, string][] = [
  ["Embert hallok vagy gépet?", "Gépet. Hanna minden hívás legelső mondatában MI-asszisztensként mutatkozik be. Ez nem beállítás, hanem szabály."],
  ["Mi van, ha olyat kérdeznek, amit nem tud?", "Nem találgat. Visszahívást ajánl, a kérdés pedig bekerül a tudásrés-listádba. Te egyszer megválaszolod, és Hanna a következő hívásnál már tudja."],
  ["Mennyibe kerül az átirányítás?", "Az átirányított hívásszakaszt a saját mobilszolgáltatód számlázza a díjcsomagod szerint. Ezt a feltételek is rögzítik, és a beállítási varázsló is kiírja."],
  ["Rögzíti a hívásokat?", "Alapból nem. Ha te bekapcsolod, a hívó erről tájékoztatást kap a beszélgetés elején."],
  ["Mi történik, ha elfogy a perckeret?", "75, 90 és 100%-nál jelzünk. Te döntöd el, mi legyen utána: automatikus feltöltés, kisebb túlhasználati díj vagy leállás. Csendben nem állunk le."],
  ["Működik az én mobilszolgáltatómmal?", "A feltételes hívásátirányítást támogató Telekom, Yettel és One előfizetésekkel igen. Élesítés előtt ellenőrző hívással megnézzük, hogy a hívás tényleg megérkezik."],
  ["Egyéni vállalkozóként is előfizethetek?", "Igen. Magyar adószám kell hozzá, más nem."],
];

export function Faq() {
  const [open, setOpen] = useState(-1);
  return (
    <div>
      {QA.map(([q, a], i) => (
        <div key={q} style={{ borderTop: "1px solid #D8DDD6", padding: "12px 0" }}>
          <button onClick={() => setOpen(open === i ? -1 : i)}
            style={{ background: "none", border: "none", padding: 0, fontSize: 16, fontWeight: 700, cursor: "pointer", color: INK, textAlign: "left" }}>
            {open === i ? "−" : "+"} {q}
          </button>
          {open === i && <p style={{ margin: "8px 0 0" }}>{a}</p>}
        </div>
      ))}
    </div>
  );
}
