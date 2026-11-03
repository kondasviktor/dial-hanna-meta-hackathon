
const UPDATED = "2026-11-03";
const VERSION = "v0.1";

export default function PrivacyContent() {
  return (
    <main className="legal-page">
      <h1>Adatvédelem</h1>
      <p className="legal-meta">
        {VERSION} · Utolsó frissítés: {UPDATED}. A magyar szöveg az irányadó. /
        Hungarian text prevails.{" "}
        <a href="/en/privacy">English below ↓</a>
      </p>

      <h2>1. Kik vagyunk</h2>
      <p>
        A Dial Hanna üzemeltetője a <strong>Dial Hanna</strong> szolgáltatás (
        <a href="https://dialhanna.com">dialhanna.com</a>). Kapcsolat:{" "}
        <a href="mailto:hello@dialhanna.com">hello@dialhanna.com</a>.
          Adatvédelmi tisztviselőt nem jelöltünk ki, mert a jogszabályok alapján
        jelenleg nem kötelező. A szolgáltató teljes azonosító adatai (név, székhely,
        nyilvántartási szám, adószám) a fizetős indulás előtt megjelennek ezen
        az oldalon.
      </p>

      <h2>2. Két szerep</h2>
      <ul>
        <li>
          <strong>Weboldal-látogatók, várólista és fióktulajdonosok</strong> esetén a
          Dial Hanna az <strong>adatkezelő</strong>.
        </li>
        <li>
          <strong>A vállalkozást felhívó személyek</strong> esetén a vállalkozás az
          adatkezelő, a Dial Hanna pedig az{" "}
          <a href="#adatfeldolgozas">adatfeldolgozási feltételek</a> szerinti{" "}
          <strong>adatfeldolgozó</strong> (GDPR 28. cikk).
        </li>
      </ul>

      <h2>3. Mit kezelünk, miért, milyen alapon, meddig</h2>
      <table>
        <thead>
          <tr>
            <th>Adat</th>
            <th>Cél</th>
            <th>Jogalap</th>
            <th>Megőrzés</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Várólista e-mail</td>
            <td>Indulási értesítés</td>
            <td>Hozzájárulás, GDPR 6. cikk (1) a)</td>
            <td>Törlési kérésig, vagy az indulás után 12 hónapig</td>
          </tr>
          <tr>
            <td>Fiókadatok (Clerk)</td>
            <td>A szolgáltatás működtetése</td>
            <td>Szerződés, 6. cikk (1) b)</td>
            <td>A fiók fennállása + 30 nap</td>
          </tr>
          <tr>
            <td>Üzleti weboldal / Facebook Oldal tartalma, tervezett GYIK</td>
            <td>Q&amp;A tervezet a vállalkozásnak</td>
            <td>Feldolgozó, a vállalkozás utasítására</td>
            <td>A fiók törléséig</td>
          </tr>
          <tr>
            <td>
              Hívó telefonszám, hívás metaadatai, név (ha elhangzik), MI-összefoglaló
              és következő lépés, foglalás adatai
            </td>
            <td>Hívás fogadása, a vállalkozás értesítése</td>
            <td>Feldolgozó, a vállalkozás utasítására</td>
            <td>A fiók lezárása + 30 nap</td>
          </tr>
          <tr>
            <td>Szervernaplók</td>
            <td>Biztonság</td>
            <td>Jogos érdek, 6. cikk (1) f)</td>
            <td>Kb. 30 nap</td>
          </tr>
        </tbody>
      </table>
      <p>
        Számlázás jelenleg nincs. Ha elindul, a számlák megőrzése a magyar
        számviteli kötelezettség szerint történik (jellemzően 8 év).
      </p>

      <h2>4. Amit nem csinálunk</h2>
      <ul>
        <li>
          <strong>Nem rögzítünk és nem tárolunk hívás hangot.</strong> A hang csak
          átmenetileg áramlik a beszédfelismerő és a hangszintézis szolgáltatókhoz,
          hogy a hívást meg lehessen válaszolni.
        </li>
        <li>
          A hívás szövegét csak az összefoglaló elkészítéséhez használjuk,{" "}
          <strong>leiratot nem tárolunk</strong>.
        </li>
        <li>Nincs hanglenyomat, nincs hangalapú azonosítás (nincs biometrikus adat).</li>
        <li>Nincs érzelemfelismerés.</li>
        <li>Nem adunk el adatot, és nincs joghatással járó automatizált döntés.</li>
      </ul>

      <h2>5. Mesterséges intelligencia</h2>
      <p>
        Minden hívás elején Hanna elmondja, hogy a vállalkozás mesterséges
        intelligencia asszisztense. Az összefoglalók és a GYIK-tervezetek
        MI-generáltak, hibát tartalmazhatnak. A vállalkozás a GYIK-et
        jóváhagyás után teszi élővé. Az irányítópulton megjelenő összefoglaló
        mellett feltüntetjük: „MI-generált összefoglaló, hibákat tartalmazhat.”
      </p>

      <h2>6. Adatfeldolgozók (alvállalkozók)</h2>
      <table>
        <thead>
          <tr>
            <th>Név</th>
            <th>Cél</th>
            <th>Helyszín</th>
            <th>Átvitel</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Vercel</td>
            <td>Tárhely / futtatás</td>
            <td>Frankfurt (EU)</td>
            <td>EU</td>
          </tr>
          <tr>
            <td>Neon</td>
            <td>Adatbázis</td>
            <td>Frankfurt, eu-central-1 (EU)</td>
            <td>EU</td>
          </tr>
          <tr>
            <td>Clerk</td>
            <td>Bejelentkezés</td>
            <td>USA</td>
            <td>DPF vagy SCC</td>
          </tr>
          <tr>
            <td>Twilio</td>
            <td>Demó telefon (US szám)</td>
            <td>USA</td>
            <td>DPF vagy SCC</td>
          </tr>
          <tr>
            <td>Telnyx</td>
            <td>Magyar telefonszámok</td>
            <td>USA</td>
            <td>DPF vagy SCC</td>
          </tr>
          <tr>
            <td>ElevenLabs</td>
            <td>Hangszintézis (TTS)</td>
            <td>USA</td>
            <td>DPF vagy SCC</td>
          </tr>
          <tr>
            <td>Meta</td>
            <td>Beszélgetés, beszédfelismerés, weboldal-import (standard modellek)</td>
            <td>USA</td>
            <td>DPF vagy SCC</td>
          </tr>
        </tbody>
      </table>
      <p>
        Az élő hívások és a weboldal-import Meta standard modelljeire mennek;
        Meta feltételei szerint ezeket a tartalmakat Meta nem használja modellek
        tanítására. (A Contributor módú modellek csak szintetikus tesztekhez
        használhatók.)
      </p>

      <h2>7. Adattovábbítás az USA-ba</h2>
      <p>
        Ahol a szolgáltató az EU–USA Data Privacy Framework szerint tanúsított,
        arra támaszkodunk; egyébként az Európai Bizottság általános szerződéses
        feltételeire (SCC). Az SCC-t tartalék biztosítékként is megjelöljük.
      </p>

      <h2>8. Jogok</h2>
      <p>
        Hozzáférés, helyesbítés, törlés, korlátozás, tiltakozás, adathordozhatóság,
        és a hozzájárulás visszavonása. A hívók először a vállalkozást keressék;
        mi segítünk a vállalkozásnak a válaszban. Panasz: NAIH, 1055 Budapest,
        Falk Miksa utca 9–11,{" "}
        <a href="https://naih.hu" rel="noopener noreferrer" target="_blank">
          naih.hu
        </a>
        . Bírósághoz is fordulhat.
      </p>

      <h2>9. Sütik</h2>
      <p>
        Csak a működéshez szükséges sütiket használunk (Clerk munkamenet).
        Analitika jelenleg nincs; ha később bevezetjük, cookie-banner jelenik meg.
      </p>

      <h2>10. Változások</h2>
      <p>
        Az oldal tetején a verziószám és a dátum jelzi a frissítést. Lényeges
        változásról a fióktulajdonosokat e-mailben is értesítjük, ha van fiókjuk.
      </p>

      <h2 id="adatfeldolgozas">11. Adatfeldolgozás (GDPR 28. cikk)</h2>
      <p>
        Az alábbi feltételek az <a href="/terms">ÁSZF</a> részét képezik, amikor a
        Dial Hanna a vállalkozás adatfeldolgozójaként kezeli a hívók és a
        személyzet adatait.
      </p>
      <h3>11.1 Tárgy, időtartam, jelleg, cél</h3>
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
      <h3>11.2 Adatok és érintettek</h3>
      <p>
        <strong>Adatok:</strong> hívó telefonszám, név ha elhangzik, a kérés az
        összefoglalóban, összefoglaló, következő lépés, foglalás adatai.{" "}
        <strong>Nincs tárolt hangfelvétel és nincs tárolt leirat.</strong>
        <br />
        <strong>Érintettek:</strong> a vállalkozást felhívó személyek, valamint a
        vállalkozás munkatársai (fiókhoz kapcsolódó adatok).
      </p>
      <h3>11.3 Utasítások és titoktartás</h3>
      <p>
        Csak a vállalkozás dokumentált utasításai szerint dolgozunk (az ÁSZF, a
        beállítások és az irányítópult). A hozzáféréssel rendelkező személyek
        titoktartásra kötelezettek (jelenleg a szolgáltató üzemeltetője).
      </p>
      <h3>11.4 Biztonság (GDPR 32. cikk)</h3>
      <ul>
        <li>TLS a forgalomban</li>
        <li>Titkosítás nyugalmi állapotban az adatbázison</li>
        <li>Éles hozzáférés korlátozva az üzemeltetőre</li>
      </ul>
      <h3>11.5 További adatfeldolgozók</h3>
      <p>
        A vállalkozás általános felhatalmazást ad a fenti 6. pontban felsorolt
        alvállalkozókra. Új alvállalkozóról legalább 15 nappal előre értesítünk;
        a vállalkozás kifogással élhet.
      </p>
      <h3>11.6 Érintetti kérelmek és együttműködés</h3>
      <p>
        Segítünk az érintetti kérelmekben és a GDPR 32–36. cikk szerinti
        kötelezettségekben, a vállalkozás ésszerű kérésére.
      </p>
      <h3>11.7 Adatvédelmi incidens</h3>
      <p>
        A vállalkozást indokolatlan késedelem nélkül értesítjük; célunk 48 órán
        belül.
      </p>
      <h3>11.8 Törlés / visszaadás</h3>
      <p>
        A szerződés végén az adatokat töröljük vagy a vállalkozás kérésére
        visszaadjuk (a 30 napos törlési határidőn belül), kivéve ha a jog
        megőrzést ír elő.
      </p>
      <h3>11.9 Ellenőrzés és adattovábbítás</h3>
      <p>
        Ellenőrzés kérdőíves formában. Az USA-ba irányuló továbbítás biztosítékai
        a 7. pont szerint (DPF vagy SCC).
      </p>
      <h3>11.10 Melléklet — sablon a hívók tájékoztatásához</h3>
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
        <h1>Privacy</h1>
        <p className="legal-meta">
          {VERSION} · Last updated: {UPDATED}. Hungarian text prevails.
        </p>

        <h2>1. Who we are</h2>
        <p>
          Dial Hanna is operated as <strong>Dial Hanna</strong> (
          <a href="https://dialhanna.com">dialhanna.com</a>). Contact:{" "}
          <a href="mailto:hello@dialhanna.com">hello@dialhanna.com</a>. No DPO is
          appointed because none is required. The provider’s full legal identity
          (name, seat, registration number, tax number) will be published on this
          page before paid launch.
        </p>

        <h2>2. Two roles</h2>
        <ul>
          <li>
            For website visitors, waitlist sign-ups and account holders, Dial Hanna
            is the <strong>controller</strong>.
          </li>
          <li>
            For people who call a business, <strong>that business is the
            controller</strong> and Dial Hanna is its <strong>processor</strong>{" "}
            under the{" "}
            <a href="#data-processing">data processing terms</a> below (GDPR
            Art. 28).
          </li>
        </ul>

        <h2>3. What we process</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Purpose</th>
              <th>Legal basis</th>
              <th>Retention</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Waitlist email</td>
              <td>Launch notice</td>
              <td>Consent, Art. 6(1)(a)</td>
              <td>Until removal request, or 12 months after launch</td>
            </tr>
            <tr>
              <td>Account data (Clerk)</td>
              <td>Running the service</td>
              <td>Contract, Art. 6(1)(b)</td>
              <td>Account term + 30 days</td>
            </tr>
            <tr>
              <td>Business website / Facebook Page content, drafted Q&amp;A</td>
              <td>Draft Q&amp;A for the business</td>
              <td>Processor, on the business’s instructions</td>
              <td>Until the account is deleted</td>
            </tr>
            <tr>
              <td>
                Caller phone number, call metadata, name if spoken, AI summary and
                next step, booking details
              </td>
              <td>Answer calls, notify the business</td>
              <td>Processor, on the business’s instructions</td>
              <td>Until account closed + 30 days</td>
            </tr>
            <tr>
              <td>Server logs</td>
              <td>Security</td>
              <td>Legitimate interest, Art. 6(1)(f)</td>
              <td>About 30 days</td>
            </tr>
          </tbody>
        </table>
        <p>
          Invoicing is not live. When it is, invoices are kept under Hungarian
          accounting rules (typically 8 years).
        </p>

        <h2>4. What we don’t do</h2>
        <ul>
          <li>
            <strong>We do not record or store call audio.</strong> Audio is
            streamed transiently to speech providers only to answer the call.
          </li>
          <li>
            Call text is used only to write the summary;{" "}
            <strong>we do not store a transcript</strong>.
          </li>
          <li>No voiceprints or voice-based identification (no biometric data).</li>
          <li>No emotion recognition.</li>
          <li>No selling of data, and no automated decisions with legal effect.</li>
        </ul>

        <h2>5. AI disclosure</h2>
        <p>
          At the start of every call Hanna says she is the business’s AI
          assistant. Summaries and drafted Q&amp;A are AI-generated and can
          contain errors. The business reviews and approves Q&amp;A before
          go-live. Dashboard summaries are labelled “AI-generated summary, may
          contain errors.”
        </p>

        <h2>6. Subprocessors</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Location</th>
              <th>Transfer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vercel</td>
              <td>Hosting</td>
              <td>Frankfurt (EU)</td>
              <td>EU</td>
            </tr>
            <tr>
              <td>Neon</td>
              <td>Database</td>
              <td>Frankfurt, eu-central-1 (EU)</td>
              <td>EU</td>
            </tr>
            <tr>
              <td>Clerk</td>
              <td>Login</td>
              <td>United States</td>
              <td>DPF or SCCs</td>
            </tr>
            <tr>
              <td>Twilio</td>
              <td>Demo telephony (US number)</td>
              <td>United States</td>
              <td>DPF or SCCs</td>
            </tr>
            <tr>
              <td>Telnyx</td>
              <td>Hungarian phone numbers</td>
              <td>United States</td>
              <td>DPF or SCCs</td>
            </tr>
            <tr>
              <td>ElevenLabs</td>
              <td>Voice synthesis (TTS)</td>
              <td>United States</td>
              <td>DPF or SCCs</td>
            </tr>
            <tr>
              <td>Meta</td>
              <td>Conversation, speech-to-text, website import (standard models)</td>
              <td>United States</td>
              <td>DPF or SCCs</td>
            </tr>
          </tbody>
        </table>
        <p>
          Live call text and website import go to Meta’s standard models; under
          Meta’s terms that content is not used to train Meta models.
          Contributor-mode models are for synthetic tests only.
        </p>

        <h2>7. Transfers to the US</h2>
        <p>
          EU–US Data Privacy Framework where the vendor is certified; otherwise
          Standard Contractual Clauses (SCCs). We list SCCs as the fallback now.
        </p>

        <h2>8. Rights</h2>
        <p>
          Access, rectification, erasure, restriction, objection, portability, and
          withdrawing consent. Callers should contact the business first; we help
          the business respond. Complaint to NAIH, 1055 Budapest, Falk Miksa utca
          9–11,{" "}
          <a href="https://naih.hu" rel="noopener noreferrer" target="_blank">
            naih.hu
          </a>
          . You may also go to court.
        </p>

        <h2>9. Cookies</h2>
        <p>
          Essential only (Clerk session). No analytics; a banner would appear if
          we add any.
        </p>

        <h2>10. Changes</h2>
        <p>
          Version and date at the top of this page. Material changes are also
          emailed to account holders when accounts exist.
        </p>

        <h2 id="data-processing">11. Data processing (GDPR Art. 28)</h2>
        <p>
          These terms form part of the <a href="/en/terms">Terms</a> when Dial
          Hanna processes caller and staff data as the business’s processor.
        </p>
        <h3>11.1 Subject matter, duration, nature and purpose</h3>
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
        <h3>11.2 Data and data subjects</h3>
        <p>
          <strong>Data:</strong> caller number, name if spoken, the request as
          reflected in the summary, summary, next step, booking details.{" "}
          <strong>No stored audio and no stored transcript.</strong>
          <br />
          <strong>Subjects:</strong> people who call the business, and the
          business’s staff (account-related data).
        </p>
        <h3>11.3 Instructions and confidentiality</h3>
        <p>
          Processing only on documented instructions (Terms, settings,
          dashboard). People with access are under confidentiality (today, the
          operator).
        </p>
        <h3>11.4 Security (Art. 32)</h3>
        <ul>
          <li>TLS in transit</li>
          <li>Encryption at rest on the database</li>
          <li>Production access limited to the operator</li>
        </ul>
        <h3>11.5 Subprocessors</h3>
        <p>
          General authorisation for the subprocessors listed in section 6 above.
          At least 15 days’ notice of changes; the business may object.
        </p>
        <h3>11.6 Data-subject requests and cooperation</h3>
        <p>
          We help with data-subject requests and with Art. 32–36 duties, on the
          business’s reasonable request.
        </p>
        <h3>11.7 Breach notice</h3>
        <p>
          We notify the customer without undue delay; target within 48 hours.
        </p>
        <h3>11.8 Deletion or return</h3>
        <p>
          At the end of the contract we delete or, on request, return the data
          (within the 30-day deletion window), unless law requires retention.
        </p>
        <h3>11.9 Audit and transfers</h3>
        <p>
          Audit by questionnaire. Transfer safeguards as in section 7 (DPF or
          SCCs).
        </p>
        <h3>11.10 Appendix — caller notice template</h3>
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
