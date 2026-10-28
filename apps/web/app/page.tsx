import Calculator from "./calculator";

const PAGE: React.CSSProperties = {
  maxWidth: 760, margin: "0 auto", padding: "0 24px 96px",
  fontFamily: "system-ui, sans-serif", color: "#1a1a1a", lineHeight: 1.6,
};
const H2: React.CSSProperties = { fontSize: 24, margin: "56px 0 16px" };
const MUTED: React.CSSProperties = { fontSize: 14, color: "#555" };
const BTN: React.CSSProperties = {
  background: "#1a1a1a", color: "#fff", padding: "12px 24px",
  textDecoration: "none", borderRadius: 6, display: "inline-block",
};
const TRIAL = "mailto:hello@dialhanna.com?subject=%C3%89rdekel%20a%20Dial%20Hanna%20pr%C3%B3ba";

const VERTICALS: [string, string][] = [
  ["Fodrászat & szépségszalon", "Festék van a kezeden, vendég ül a székben — fizikailag lehetetlen felvenni."],
  ["Autószerviz", "Zajos műhely, olajos kéz — mire előkerülsz az emelő alól, a hívó rég letette."],
  ["Szakipar & szerelők", "Doboznál, csőtörésnél, tetőn: olyan helyeken dolgozol, ahol telefont felvenni nem lehet."],
  ["Könyvelőiroda", "Bevallási hajrában csörög a telefon, de az ügyfél anyaga fontosabb — a hívó mégis választ vár."],
];

const PLAYBOOKS: [string, string][] = [
  ["Időpontfoglalás", "Hanna egyezteti az időpontot és beírja a Google Naptáradba — a hívó azonnal visszaigazolást kap."],
  ["Üzenet & visszahívás", "Rögzíti, ki keresett, mit akart és mikor hívhatod — kategorizált teendőként, nem cetliken."],
  ["Árajánlatkérés", "Összegyűjti az ajánlathoz kellő adatokat, te pedig kész csomaggal hívsz vissza."],
];

const BEFORE_AFTER: [string, string][] = [
  ["Nem tudod felvenni, az ügyfél mást keres.", "Az átirányított hívást Hanna fogadja a saját számod mögött."],
  ["Minden csörrenés megszakítja a munkát.", "Hanna kezeli a hívást, te zavartalanul dolgozol."],
  ["Nem látod, ki hívott és mit akart.", "Irányítópult: hívások, foglalások és teendők egy helyen."],
];

const PLANS: [string, string, string, string][] = [
  ["Essential", "19 900 Ft + áfa / hó", "100 AI-perc", "Tudásbázis, magyar + angol, üzenet és visszahívás, eredmények, tanulási kör. Naptárfoglalás nélkül."],
  ["Pro", "34 900 Ft + áfa / hó", "250 AI-perc", "Minden Essential + Google Naptár foglalás, módosítás, lemondás."],
  ["Business", "59 900 Ft + áfa / hó", "500 AI-perc", "Minden Pro + 3 telephely/szám, 3 csapattag, kiemelt támogatás."],
];

const FAQS: [string, string][] = [
  ["Megtarthatom a számom?", "Igen. A saját számod marad; a szolgáltatódnál állítod be, hogy foglalt, nem fogadott vagy elérhetetlen esetben hová fusson tovább a hívás."],
  ["Kibe kerül a továbbítás?", "A továbbított szakasz díját a saját mobilszolgáltatód számlázza — ez minden átirányításnál így van, függetlenül tőlünk."],
  ["Honnan tudja Hanna a válaszaimat?", "Weboldaladból, dokumentumaidból és egy rövid hangüzenetből építjük fel a tudást — te nézed át, mielőtt élőben válaszolna. Amit nem tud, nem találgatja."],
  ["Mi van, ha valamit nem tud?", "Felveszi a kérdést, visszahívást ajánl, te egy mondattal megválaszolod — legközelebb már tudja."],
  ["Rögzíti a hívásokat?", "Alapból nem. Ha kéred, bekapcsolható — ilyenkor a hívás elején Hanna ezt be is mondja."],
];

export default function Home() {
  return (
    <div style={PAGE}>
      <nav style={{ display: "flex", gap: 16, padding: "20px 0", fontSize: 14, alignItems: "center" }}>
        <strong style={{ marginRight: "auto" }}>Dial Hanna</strong>
        <a href="#hogyan">Hogyan működik</a>
        <a href="#arak">Árak</a>
        <a href="#gyik">GYIK</a>
        <a href={TRIAL} style={{ ...BTN, padding: "8px 16px" }}>Ingyen kipróbálom</a>
      </nav>

      <p style={{ ...MUTED, margin: "32px 0 8px" }}>Saját számodon · éjjel-nappal</p>
      <h1 style={{ fontSize: 40, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: -0.5 }}>
        Te dolgozol. Hanna fogadja az átirányított hívásokat.
      </h1>
      <p style={{ fontSize: 18, margin: "0 0 24px" }}>
        Megtartod a mobilszámod. Ha nem érsz rá, a hívás Hannához fut be: magyarul válaszol,
        időpontot foglal, üzenetet vesz át. Te kész listát kapsz.
      </p>
      <p style={{ margin: "0 0 16px" }}>
        <a href={TRIAL} style={BTN}>Ingyen kipróbálom</a>{" "}
        <a href="#hogyan" style={{ padding: "12px 8px" }}>Hogyan működik</a>
      </p>
      <p style={MUTED}>Saját mobilszám marad · Bankkártya nélkül próbálható · 5 perc beállítás · GDPR-kompatibilis · Magyar fejlesztés</p>

      <h2 style={H2}>Kiknek segít a legtöbbet?</h2>
      <p>Akkor, amikor munka közben nem tudod felvenni.</p>
      {VERTICALS.map(([t, b]) => (
        <div key={t} style={{ marginBottom: 16 }}>
          <strong>{t}</strong>
          <p style={{ margin: "4px 0 0" }}>{b}</p>
        </div>
      ))}

      <h2 style={H2}>Egy hívás, kész eredmény</h2>
      <p>Hanna felveszi. Elintézi. Te átlátod.</p>
      {PLAYBOOKS.map(([t, b]) => (
        <div key={t} style={{ marginBottom: 16 }}>
          <strong>{t}</strong>
          <p style={{ margin: "4px 0 0" }}>{b}</p>
        </div>
      ))}

      <h2 style={H2} id="hogyan">Három lépésben él</h2>
      {[["01", "A saját számodat hívják", "Ha nem érsz rá, a hívás automatikusan Hannához fut be."],
        ["02", "Magyarul intézkedik", "Válaszol, adatot rögzít, időpontot foglal vagy teendőt készít."],
        ["03", "Kész eredményt kapsz", "Az irányítópulton látod a hívást, a foglalást és a következő lépést."],
      ].map(([n, t, b]) => (
        <div key={n} style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, minWidth: 32 }}>{n}</div>
          <div><strong>{t}</strong><p style={{ margin: "4px 0 0" }}>{b}</p></div>
        </div>
      ))}
      <p style={MUTED}>Az első hívás után nem hangfelvételt, hanem rendezett teendőt kapsz: ki keresett, mit akart, mi a következő lépés.</p>

      <h2 style={H2}>Előtte és utána</h2>
      {BEFORE_AFTER.map(([b, a]) => (
        <div key={b} style={{ marginBottom: 12 }}>
          <div>Előtte: {b}</div>
          <div><strong>Utána: {a}</strong></div>
        </div>
      ))}

      <h2 style={H2}>Számold ki a saját számaiddal</h2>
      <p>Mennyi munkát hozhatnak a nem fogadott hívások?</p>
      <Calculator />

      <h2 style={H2} id="arak">Árak</h2>
      <p>14 nap próba, bankkártya nélkül, 40 AI-perccel. Nincs bekötési díj.</p>
      {PLANS.map(([t, p, m, b]) => (
        <div key={t} style={{ borderTop: "1px solid #ddd", padding: "16px 0" }}>
          <strong>{t}</strong> · {p} · {m}
          <p style={{ margin: "4px 0 0" }}>{b}</p>
        </div>
      ))}
      <p style={MUTED}>Feltöltés: 9 900 Ft / 100 perc. Az árak nettó, + áfa.</p>

      <h2 style={H2} id="gyik">Gyakori kérdések</h2>
      {FAQS.map(([q, a]) => (
        <div key={q} style={{ marginBottom: 16 }}>
          <strong>{q}</strong>
          <p style={{ margin: "4px 0 0" }}>{a}</p>
        </div>
      ))}

      <p style={{ marginTop: 48 }}>
        <a href={TRIAL} style={BTN}>Ingyen kipróbálom</a>
      </p>
      <hr style={{ margin: "48px 0 24px", border: "none", borderTop: "1px solid #ddd" }} />
      <p style={MUTED}>Dial Hanna · hello@dialhanna.com · <a href="/api/health">státusz</a></p>
    </div>
  );
}
