import Calculator from "./calculator";
import { CallTabs, Pricing, Faq } from "./landing";

const PAGE: React.CSSProperties = {
  maxWidth: 760, margin: "0 auto", padding: "0 24px 96px", lineHeight: 1.6,
};
const H2: React.CSSProperties = { fontSize: 24, margin: "56px 0 16px" };
const MUTED: React.CSSProperties = { fontSize: 14, color: "#3E5157" };
const BTN: React.CSSProperties = {
  background: "#0C1C20", color: "#fff", padding: "12px 24px",
  textDecoration: "none", borderRadius: 6, display: "inline-block",
};
const TRIAL = "mailto:hello@dialhanna.com?subject=%C3%89rdekel%20a%20Dial%20Hanna%20pr%C3%B3ba";

const VERTICALS: [string, string, string][] = [
  ["Szépségszalon", "Olló a kézben, vendég a székben. A csörgő telefon várhat, a hívó viszont nem.", "szabad időpontot ajánl, és beírja a naptárba."],
  ["Autószerviz", "Az autó az emelőn, a kéz olajos. Mire előkerülsz, a hívó már a következő műhelyt tárcsázza.", "megválaszolja az ár- és nyitvatartási kérdéseket, felveszi a hibaleírást."],
  ["Szakipar", "Létrán, fúró mellett, az ügyfélnél. A kiszállás közben érkező megrendelés is érték.", "felveszi a címet és a hiba leírását, a sürgőset megjelöli."],
  ["Könyvelőiroda", "Zárás előtti hajrá, határidők. Az ügyfél mégis választ vár.", "időpontot egyeztet, és üzenetet hagy a megfelelő kollégának."],
];

export default function Home() {
  return (
    <div style={PAGE}>
      <nav style={{ display: "flex", gap: 16, padding: "20px 0", fontSize: 14, alignItems: "center" }}>
        <strong style={{ marginRight: "auto" }}>Dial Hanna</strong>
        <a href="#hogyan">Hogyan működik</a>
        <a href="#arak">Árak</a>
        <a href="#gyik">GYIK</a>
        <a href="/demo" style={{ ...BTN, padding: "8px 16px" }}>Böngészős demo</a>
      </nav>

      <p style={{ ...MUTED, margin: "32px 0 8px" }}>Saját számodon · éjjel-nappal</p>
      <h1 style={{ fontSize: 40, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: -0.5 }}>
        Te dolgozol. Hanna fogadja az átirányított hívásokat.
      </h1>
      <p style={{ fontSize: 18, margin: "0 0 24px" }}>
        Megtartod a mobilszámod. Ha nem érsz rá, a hívás Hannához fut be: magyarul válaszol,
        időpontot foglal, üzenetet vesz át. Te kész listát kapsz — nem hangfelvételt, hanem teendőt.
      </p>

      <CallTabs />

      <p style={{ margin: "24px 0 0" }}>
        <a href={TRIAL} style={BTN}>Ingyen kipróbálom</a>{" "}
        <a href="/demo" style={{ padding: "12px 8px" }}>Hívd fel a böngésződből</a>
      </p>
      <p style={MUTED}>Saját mobilszám marad · Bankkártya nélkül próbálható · 5 perc beállítás · GDPR-kompatibilis · Magyar fejlesztés</p>

      <h2 style={H2} id="hogyan">Három lépésben él</h2>
      {[["01", "A saját számodat hívják", "Ha nem érsz rá, a hívás automatikusan Hannához fut be."],
        ["02", "Magyarul intézkedik", "Válaszol, adatot rögzít, időpontot foglal vagy teendőt készít."],
        ["03", "Kész eredményt kapsz", "Az irányítópulton látod a hívást, a foglalást és a következő lépést."],
      ].map(([n, t, b]) => (
        <div key={n} style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <div className="mono" style={{ fontWeight: 700, minWidth: 32 }}>{n}</div>
          <div><strong>{t}</strong><p style={{ margin: "4px 0 0" }}>{b}</p></div>
        </div>
      ))}

      <h2 style={H2}>Kiknek segít a legtöbbet?</h2>
      {VERTICALS.map(([t, pain, does]) => (
        <div key={t} style={{ marginBottom: 16 }}>
          <strong>{t}</strong>
          <p style={{ margin: "4px 0 0" }}>{pain} Hanna {does}</p>
        </div>
      ))}

      <h2 style={H2}>Amit nem tud, megtanulod egy mondattal</h2>
      <p>
        Ismeretlen kérdés → visszahívási ajánlat → a kérdés a tudásrés-listádra kerül →
        egyszer megválaszolod → új verzió, gyorsteszt, egy kattintásos élesítés.
        Csak azután megy élőben, hogy a tesztcsomag szerint kész van.
      </p>

      <h2 style={H2}>Számold ki a saját számaiddal</h2>
      <p>Mennyi munkát hozhatnak a nem fogadott hívások?</p>
      <Calculator />

      <h2 style={H2} id="arak">Árak</h2>
      <Pricing />

      <h2 style={H2} id="gyik">Gyakori kérdések</h2>
      <Faq />

      <p style={{ marginTop: 48 }}>
        <a href={TRIAL} style={BTN}>Ingyen kipróbálom</a>
      </p>
      <hr style={{ margin: "48px 0 24px", border: "none", borderTop: "1px solid #D8DDD6" }} />
      <p style={MUTED}>Dial Hanna · hello@dialhanna.com · <a href="/api/health">státusz</a> · <a href="/dashboard">bejelentkezés</a></p>
    </div>
  );
}
