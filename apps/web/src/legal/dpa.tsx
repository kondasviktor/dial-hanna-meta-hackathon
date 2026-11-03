
const UPDATED = "2026-11-03";
const VERSION = "v0.1";

export default function DpaContent() {
  return (
    <main className="legal-page">
      <h1>Adatfeldolgozási feltételek</h1>
      <p className="legal-meta">
        {VERSION} · Utolsó frissítés: {UPDATED}. GDPR 28. cikk. A magyar szöveg
        az irányadó. / Hungarian text prevails.{" "}
        <a href="/en/dpa">English below ↓</a>
      </p>
      <p>
        Ezek a feltételek az <a href="/terms">ÁSZF</a> részét képezik, amikor a
        Dial Hanna a vállalkozás adatfeldolgozójaként kezeli a hívók és a
        személyzet adatait.
      </p>

      <h2>1. Tárgy, időtartam, jelleg, cél</h2>
      <p>
        <strong>Tárgy:</strong> a továbbított hívások fogadása, strukturált
        összefoglaló és következő lépés készítése és tárolása, Q&amp;A tervezet a
        vállalkozás weboldalából / Oldalából.
        <br />
        <strong>Időtartam:</strong> a fiók fennállása, majd törlés 30 napon belül.
        <br />
        <strong>Jelleg és cél:</strong> automatizált hangasszisztens és
        utófeldolgozás a vállalkozás utasítására.
      </p>

      <h2>2. Adatok és érintettek</h2>
      <p>
        <strong>Adatok:</strong> hívó telefonszám, név ha elhangzik, a kérés az
        összefoglalóban, összefoglaló, következő lépés, foglalás adatai.{" "}
        <strong>Nincs tárolt hangfelvétel és nincs tárolt leirat.</strong>
        <br />
        <strong>Érintettek:</strong> a vállalkozást felhívó személyek, valamint a
        vállalkozás munkatársai (fiókhoz kapcsolódó adatok).
      </p>

      <h2>3. Utasítások és titoktartás</h2>
      <p>
        Csak a vállalkozás dokumentált utasításai szerint dolgozunk (az ÁSZF, a
        beállítások és az irányítópult). A hozzáféréssel rendelkező személyek
        titoktartásra kötelezettek (jelenleg a szolgáltató üzemeltetője).
      </p>

      <h2>4. Biztonság (GDPR 32. cikk)</h2>
      <ul>
        <li>TLS a forgalomban</li>
        <li>Titkosítás nyugalmi állapotban az adatbázison</li>
        <li>Éles hozzáférés korlátozva az üzemeltetőre</li>
      </ul>

      <h2>5. További adatfeldolgozók</h2>
      <p>
        A vállalkozás általános felhatalmazást ad az{" "}
        <a href="/privacy">Adatvédelmi tájékoztatóban</a> felsorolt
        alvállalkozókra. Új alvállalkozóról legalább 15 nappal előre értesítünk;
        a vállalkozás kifogással élhet.
      </p>

      <h2>6. Érintetti kérelmek és együttműködés</h2>
      <p>
        Segítünk az érintetti kérelmekben és a GDPR 32–36. cikk szerinti
        kötelezettségekben, a vállalkozás ésszerű kérésére.
      </p>

      <h2>7. Adatvédelmi incidens</h2>
      <p>
        A vállalkozást indokolatlan késedelem nélkül értesítjük; célunk 48 órán
        belül.
      </p>

      <h2>8. Törlés / visszaadás</h2>
      <p>
        A szerződés végén az adatokat töröljük vagy a vállalkozás kérésére
        visszaadjuk (a 30 napos törlési határidőn belül), kivéve ha a jog
        megőrzést ír elő.
      </p>

      <h2>9. Ellenőrzés és adattovábbítás</h2>
      <p>
        Ellenőrzés kérdőíves formában. Az USA-ba irányuló továbbítás biztosítékai
        az Adatvédelmi tájékoztató szerint (DPF vagy SCC).
      </p>

      <h2>Melléklet — sablon a hívók tájékoztatásához</h2>
      <p>
        Másolja be a saját adatvédelmi tájékoztatójába (a [Vállalkozás] helyére
        a saját nevét írja):
      </p>
      <blockquote>
        A [Vállalkozás] hívásait, ha nem tudjuk felvenni, Hanna, a vállalkozás
        mesterséges intelligencia asszisztense fogadhatja. A hívást nem
        rögzítjük. A vállalkozás írásos összefoglalót és javasolt következő
        lépést kap. Hozzáférés vagy törlés iránti kérelemmel a vállalkozást
        keresse.
      </blockquote>

      <section className="legal-lang" lang="en" id="en">
        <h1>Data Processing Terms</h1>
        <p className="legal-meta">
          {VERSION} · Last updated: {UPDATED}. GDPR Art. 28. Hungarian text
          prevails.
        </p>
        <p>
          These terms form part of the <a href="/en/terms">Terms</a> when Dial
          Hanna processes caller and staff data as the business’s processor.
        </p>

        <h2>1. Subject matter, duration, nature and purpose</h2>
        <p>
          <strong>Subject:</strong> answering forwarded calls; drafting and
          storing a structured summary and next step; drafting Q&amp;A from the
          customer’s website / Page.
          <br />
          <strong>Duration:</strong> the account, then deletion within 30 days.
          <br />
          <strong>Nature and purpose:</strong> automated voice assistant and
          post-call processing on the business’s instructions.
        </p>

        <h2>2. Data and data subjects</h2>
        <p>
          <strong>Data:</strong> caller number, name if spoken, the request as
          reflected in the summary, summary, next step, booking details.{" "}
          <strong>No stored audio and no stored transcript.</strong>
          <br />
          <strong>Subjects:</strong> people who call the business, and the
          business’s staff (account-related data).
        </p>

        <h2>3. Instructions and confidentiality</h2>
        <p>
          Processing only on documented instructions (Terms, settings,
          dashboard). People with access are under confidentiality (today, the
          operator).
        </p>

        <h2>4. Security (Art. 32)</h2>
        <ul>
          <li>TLS in transit</li>
          <li>Encryption at rest on the database</li>
          <li>Production access limited to the operator</li>
        </ul>

        <h2>5. Subprocessors</h2>
        <p>
          General authorisation for the subprocessors listed in the{" "}
          <a href="/en/privacy">Privacy policy</a>. At least 15 days’ notice of
          changes; the business may object.
        </p>

        <h2>6. Data-subject requests and cooperation</h2>
        <p>
          We help with data-subject requests and with Art. 32–36 duties, on the
          business’s reasonable request.
        </p>

        <h2>7. Breach notice</h2>
        <p>
          We notify the customer without undue delay; target within 48 hours.
        </p>

        <h2>8. Deletion or return</h2>
        <p>
          At the end of the contract we delete or, on request, return the data
          (within the 30-day deletion window), unless law requires retention.
        </p>

        <h2>9. Audit and transfers</h2>
        <p>
          Audit by questionnaire. Transfer safeguards as in the Privacy policy
          (DPF or SCCs).
        </p>

        <h2>Appendix — caller notice template</h2>
        <p>
          Paste into your own privacy notice (replace [Business] with your
          name):
        </p>
        <blockquote>
          If [Business] cannot answer your call, Hanna, an AI assistant of
          [Business], may pick up. The call is not recorded. The business
          receives a written summary and a suggested next step. For access or
          deletion, contact the business.
        </blockquote>
      </section>

      <p style={{ marginTop: 32 }}>
        <a href="/">← Dial Hanna</a>
      </p>
    </main>
  );
}
