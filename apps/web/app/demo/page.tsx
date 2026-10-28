"use client";

import { useState } from "react";

const PANEL = "#0E2A30";
const AMBER = "#FFB62E";

interface Biz {
  name: string;
  kindHu: string;
  kindEn: string;
  tryHu: string;
  tryEn: string;
  hu: [string, string][];
  en: [string, string][];
  outHu: string;
  outEn: string;
}

const BIZ: Biz[] = [
  {
    name: "Rózsa Szépségszalon", kindHu: "Szépségszalon", kindEn: "Hair salon",
    tryHu: "Próbáld: „Péntek délutánra szeretnék női hajvágásra időpontot.”",
    tryEn: "Try: “Do you have a slot for a trim on Saturday?”",
    hu: [
      ["Hanna", "Jó napot kívánok, a Rózsa Szépségszalon vonalán Hanna beszél, a vállalkozás mesterséges intelligencia alapú asszisztense. Miben segíthetek?"],
      ["Hívó", "Péntek délutánra szeretnék női hajvágásra időpontot."],
      ["Hanna", "Egy pillanat, megnézem. Pénteken 14:30-kor van szabad hely. Foglaljam be?"],
      ["Hívó", "Igen. Kovács Anna vagyok."],
      ["Hanna", "Rendben, lefoglaltam péntekre 14:30-ra. Viszonthallásra!"],
    ],
    en: [
      ["Hanna", "Hello, you have reached Rózsa Szépségszalon. This is Hanna, the business's AI assistant. How can I help?"],
      ["Caller", "Do you have a slot for a trim on Saturday?"],
      ["Hanna", "One moment, let me check. Saturday at 10:00 is free. Shall I book it?"],
      ["Caller", "Yes please."],
      ["Hanna", "Booked: trim, Saturday at 10:00. See you then!"],
    ],
    outHu: "Lefoglalva: női hajvágás, péntek 14:30. Nincs teendő.",
    outEn: "Booked: trim, Saturday 10:00. Nothing to do.",
  },
  {
    name: "Kovács Autószerviz", kindHu: "Autószerviz", kindEn: "Auto repair",
    tryHu: "Próbáld: „Mennyibe kerül a fékbetétcsere, és van náluk parkoló?”",
    tryEn: "Try: “How much is a brake pad change, and do you have parking?”",
    hu: [
      ["Hanna", "Jó napot kívánok, a Kovács Autószerviz vonalán Hanna beszél, a vállalkozás mesterséges intelligencia alapú asszisztense. Miben segíthetek?"],
      ["Hívó", "Mennyibe kerül egy fékbetétcsere?"],
      ["Hanna", "Az első fékbetétcsere munkadíja 25 000 forinttól indul, az alkatrész ára a típustól függ."],
      ["Hívó", "És van náluk parkoló?"],
      ["Hanna", "Erről most nincs biztos információm. Továbbítom a kérdést, és kérem, hagyja meg a számát, hogy visszahívhassák."],
    ],
    en: [
      ["Hanna", "Hello, you have reached Kovács Autószerviz. This is Hanna, the business's AI assistant. How can I help?"],
      ["Caller", "How much is a brake pad change?"],
      ["Hanna", "Labour starts at 25,000 forints. Parts depend on the car model."],
      ["Caller", "And do you have parking?"],
      ["Hanna", "I don't have reliable information on that. I'll pass the question on and take your number for a callback."],
    ],
    outHu: "Tudásrés: parkolás. Válaszolj egyszer, és Hanna legközelebb tudja.",
    outEn: "Knowledge gap: parking. Answer once and Hanna will know next time.",
  },
];

export default function DemoCall() {
  const [biz, setBiz] = useState(0);
  const [lang, setLang] = useState<"hu" | "en">("hu");
  const [shown, setShown] = useState(0);
  const b = BIZ[biz];
  const lines = lang === "hu" ? b.hu : b.en;
  const start = () => {
    setShown(0);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= lines.length) clearInterval(t);
    }, 1800);
  };
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 96px", lineHeight: 1.6 }}>
      <p><a href="/">← Főoldal</a></p>
      <h1>Hívd fel Hannát a böngésződből</h1>
      <p style={{ color: "#3E5157", fontSize: 14 }}>
        Forgatókönyves bemutató — az élő hangkapcsolat a következő lépésben érkezik.
        Válassz vállalkozást és nyelvet, indítsd el, és nézd végig a hívást.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {BIZ.map((x, i) => (
          <button key={x.name} onClick={() => { setBiz(i); setShown(0); }}
            style={btn(biz === i)}>{x.name}</button>
        ))}
        <span style={{ width: 8 }} />
        <button onClick={() => { setLang("hu"); setShown(0); }} style={btn(lang === "hu")}>HU</button>
        <button onClick={() => { setLang("en"); setShown(0); }} style={btn(lang === "en")}>EN</button>
      </div>
      <p style={{ fontSize: 14, color: "#3E5157" }}>{lang === "hu" ? b.tryHu : b.tryEn}</p>
      <p><button onClick={start} style={callBtn}>Hívás indítása</button></p>
      <div style={{ background: PANEL, color: "#fff", borderRadius: 12, padding: 24, minHeight: 220 }}>
        {shown === 0 && <p style={{ color: "#D6E4E6" }}>Nyomd meg a hívás indítását…</p>}
        {lines.slice(0, shown).map(([who, text], i) => (
          <p key={i} style={{ margin: "0 0 8px", fontSize: 15 }}>
            <strong style={{ color: who === "Hanna" || who === "Hanna" ? AMBER : "#fff" }}>{who}:</strong> {text}
          </p>
        ))}
        {shown >= lines.length && (
          <p className="mono" style={{ fontSize: 13, color: "#D6E4E6" }}>{lang === "hu" ? b.outHu : b.outEn}</p>
        )}
      </div>
    </div>
  );
}

function btn(on: boolean): React.CSSProperties {
  return {
    background: on ? "#0C1C20" : "transparent", color: on ? "#fff" : "#0C1C20",
    border: "1px solid #0C1C20", borderRadius: 6, padding: "6px 14px", cursor: "pointer",
  };
}

const callBtn: React.CSSProperties = {
  background: "#0C1C20", color: "#fff", border: "none",
  borderRadius: 6, padding: "12px 28px", cursor: "pointer", fontSize: 16,
};
