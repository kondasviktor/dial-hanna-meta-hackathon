const STEPS = [
  {
    n: "1",
    title: "Tartsd meg a számod",
    body: "Foglaltság, nem fogadott hívás vagy elérhetetlenség esetén a hívások automatikusan Hannához futnak be. Semmi új szám, semmi átállás.",
  },
  {
    n: "2",
    title: "Hanna felveszi helyetted",
    body: "A vállalkozásod nevében, ellenőrzött tudásból válaszol, időpontot foglal a naptáradba, vagy üzenetet vesz át visszahívásra.",
  },
  {
    n: "3",
    title: "Minden hívásból teendő lesz",
    body: "Szándék → eredmény → következő lépés: látod, ki keresett, mit akart, és mit kell tenned. Amit Hanna nem tudott, egy mondattal tanítod meg.",
  },
];

const VERTICALS = ["Fodrászat & szépségszalon", "Autószerviz", "Szakipar & szerelők", "Könyvelőiroda"];

const FAQS = [
  {
    q: "Le kell cserélnem a telefonszámom?",
    a: "Nem. Megtartod a számod, és a szolgáltatódnál állítod be, hogy foglalt vagy nem fogadott hívás hová fusson tovább.",
  },
  {
    q: "Kibe kerül a továbbítás?",
    a: "A továbbított szakasz díját a saját mobilszolgáltatód számlázza feléd — ez minden átirányításnál így működik, szolgáltatótól függetlenül.",
  },
  {
    q: "Magyarul is tud Hanna?",
    a: "Igen, magyarul és angolul beszél, és hívás közben is tud nyelvet váltani, ha a hívó angolul szólal meg.",
  },
  {
    q: "Mi van, ha valamit nem tud?",
    a: "Nem találgat: felveszi a kérdést, visszahívást ajánl, te pedig egy mondattal megválaszolod — legközelebb már tudja.",
  },
];

export default function Home() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 96px", fontFamily: "system-ui, sans-serif", color: "#1a1a1a", lineHeight: 1.6 }}>
      <p style={{ margin: "0 0 8px", fontSize: 14 }}>Dial Hanna · magyar kisvállalkozásoknak</p>
      <h1 style={{ fontSize: 40, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: -0.5 }}>
        Soha többé nem marad le egy ügyfélhívásról sem.
      </h1>
      <p style={{ fontSize: 18, margin: "0 0 24px" }}>
        Hanna felveszi, amikor te nem tudod — hajvágás közben, szerelésen, úton vagy zárás után.
        Párhuzamosan is, amikor egyszerre csörög minden.
      </p>
      <p style={{ margin: "0 0 64px" }}>
        <a
          href="mailto:hello@dialhanna.com?subject=%C3%89rdekel%20a%20Dial%20Hanna%20pr%C3%B3ba"
          style={{ background: "#1a1a1a", color: "#fff", padding: "12px 24px", textDecoration: "none", borderRadius: 6 }}
        >
          Kérek 14 napos próbát
        </a>
      </p>

      <h2 style={{ fontSize: 24, margin: "0 0 16px" }}>Így működik</h2>
      {STEPS.map((s) => (
        <div key={s.n} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 700, minWidth: 32 }}>{s.n}</div>
          <div>
            <strong>{s.title}</strong>
            <p style={{ margin: "4px 0 0" }}>{s.body}</p>
          </div>
        </div>
      ))}

      <h2 style={{ fontSize: 24, margin: "48px 0 16px" }}>Kiknek készült</h2>
      <ul style={{ paddingLeft: 20, margin: 0 }}>
        {VERTICALS.map((v) => (
          <li key={v} style={{ marginBottom: 6 }}>{v}</li>
        ))}
      </ul>
      <p style={{ fontSize: 14, color: "#444" }}>
        Egy megmentett időpont egy hónapban már kifizeti a szolgáltatást.
      </p>

      <h2 style={{ fontSize: 24, margin: "48px 0 16px" }}>Gyakori kérdések</h2>
      {FAQS.map((f) => (
        <div key={f.q} style={{ marginBottom: 16 }}>
          <strong>{f.q}</strong>
          <p style={{ margin: "4px 0 0" }}>{f.a}</p>
        </div>
      ))}

      <hr style={{ margin: "64px 0 24px", border: "none", borderTop: "1px solid #ddd" }} />
      <p style={{ fontSize: 14, color: "#444" }}>
        Dial Hanna · 14 nap próba, bankkártya nélkül ·{" "}
        <a href="/api/health">státusz</a>
      </p>
    </div>
  );
}
