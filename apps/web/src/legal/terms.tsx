
const UPDATED = "2026-11-03";
const VERSION = "v0.1";

export default function TermsContent() {
  return (
    <main className="legal-page">
      <h1>Általános szerződési feltételek (ÁSZF)</h1>
      <p className="legal-meta">
        {VERSION} · Utolsó frissítés: {UPDATED}. A magyar szöveg az irányadó. /
        Hungarian text prevails.{" "}
        <a href="/en/terms">English below ↓</a>
      </p>

      <h2>1. Szolgáltató</h2>
      <p>
        Dial Hanna (<a href="https://dialhanna.com">dialhanna.com</a>), kapcsolat:{" "}
        <a href="mailto:hello@dialhanna.com">hello@dialhanna.com</a>. A szolgáltató
        teljes azonosító adatai a fizetős indulás előtt megjelennek. A szolgáltatás
        jelenleg várólistás béta, „ahogy van” alapon.
      </p>

      <h2>2. Csak vállalkozásoknak</h2>
      <p>
        A szolgáltatás vállalkozásoknak és egyéni vállalkozóknak szól, nem
        fogyasztóknak (B2B).
      </p>

      <h2>3. A szolgáltatás</h2>
      <p>
        A továbbított hívásokat mesterséges intelligencia hangasszisztens (Hanna)
        fogadja. A vállalkozás az irányítópulton összefoglalót és következő lépést
        kap (később e-mailben is, a fiók e-mail címére). A Q&amp;A a vállalkozás
        által megadott weboldalból vagy Facebook Oldalból készül tervezetként.
      </p>

      <h2>4. Az ügyfél kötelezettségei</h2>
      <ul>
        <li>Jogosult a számát továbbítani.</li>
        <li>
          Tájékoztatja a hívóit — ehhez az{" "}
          <a href="/dpa">Adatfeldolgozási feltételek</a> mellékletében van
          sablon.
        </li>
        <li>
          Átnézi és jóváhagyja az MI által tervezett Q&amp;A-t, és felel annak
          pontosságáért.
        </li>
        <li>Csak olyan weboldalt és Oldalt ad meg, amely felett rendelkezik.</li>
        <li>
          Nem állítja be Hannát egészségügyi adatok, bankkártyaszámok vagy más
          különleges adatok gyűjtésére.
        </li>
      </ul>

      <h2>5. Nem vészhelyzetre, nem orvosi vagy jogi tanács</h2>
      <p>
        Hanna tévedhet. Az összefoglaló nem garancia. A szolgáltatás nem
        helyettesít embert vészhelyzetben, orvosi vagy jogi ügyekben.
      </p>

      <h2>6. Telefonszámok</h2>
      <p>
        A magyar szám hozzárendelt, nem a vállalkozás tulajdona. A szolgáltató
        és a hálózat szabályai, valamint az azonosítási (KYC) kötelezettségek
        érvényesek. A saját szolgáltató továbbítási díjai az ügyfelet terhelik.
      </p>

      <h2>7. Elfogadható használat</h2>
      <p>
        Tilos a jogellenes, megtévesztő vagy zaklató használat. Kimenő hívás
        (outbound) nem része a szolgáltatásnak.
      </p>

      <h2>8. Felelősség</h2>
      <p>
        A felelősség a megelőző 12 hónapban fizetett díjakra korlátozódik — a
        bétában ez nulla. Nem vállalunk felelősséget elmulasztott hívásokért,
        hálózati kiesésért vagy MI-hibákért, kivéve ahol a jog nem engedi a
        kizárást (szándékosság, súlyos gondatlanság, élet vagy egészség
        sérelme).
      </p>

      <h2>9. Felfüggesztés és megszüntetés</h2>
      <p>
        A feltételek megsértése esetén a hozzáférést felfüggeszthetjük vagy
        megszüntethetjük. A fiók lezárása után az adatokat 30 napon belül
        töröljük.
      </p>

      <h2>10. Árak</h2>
      <p>
        Fizetés jelenleg nincs. A fizetős induláskor az árak és az adóügyi
        megjegyzés (pl. alanyi adómentesség) itt jelenik meg.
      </p>

      <h2>11. Jog, bíróság, nyelv, változások</h2>
      <p>
        Magyar jog, budapesti bíróságok. A magyar szöveg az irányadó. Lényeges
        változásokat legalább 15 nappal előre jelezzük.
      </p>

      <h2>12. Adatfeldolgozás</h2>
      <p>
        Az <a href="/dpa">Adatfeldolgozási feltételek</a> az ÁSZF részét képezik.
      </p>

      <section className="legal-lang" lang="en" id="en">
        <h1>Terms of service</h1>
        <p className="legal-meta">
          {VERSION} · Last updated: {UPDATED}. Hungarian text prevails.
        </p>

        <h2>1. Provider</h2>
        <p>
          Dial Hanna (<a href="https://dialhanna.com">dialhanna.com</a>), contact:{" "}
          <a href="mailto:hello@dialhanna.com">hello@dialhanna.com</a>. Full legal
          identity will be published before paid launch. The service is a waitlist
          beta, provided as-is.
        </p>

        <h2>2. B2B only</h2>
        <p>
          The service is for businesses and sole traders, not consumers.
        </p>

        <h2>3. Service</h2>
        <p>
          Forwarded calls are answered by an AI voice assistant (Hanna). The
          business receives a summary and next step on the dashboard (later also
          by email, to the account email only). Q&amp;A is drafted from the
          website or Facebook Page the customer submits.
        </p>

        <h2>4. Customer obligations</h2>
        <ul>
          <li>You have the right to forward the number.</li>
          <li>
            You inform your callers, using the template in the{" "}
            <a href="/en/dpa">Data Processing Terms</a>.
          </li>
          <li>
            You review and approve the AI-drafted Q&amp;A and are responsible for
            its accuracy.
          </li>
          <li>You submit only websites and Pages you control.</li>
          <li>
            You do not configure Hanna to collect health data, card numbers or
            other sensitive data.
          </li>
        </ul>

        <h2>5. Not for emergencies, medical or legal advice</h2>
        <p>
          Hanna may make mistakes. The summary is not a guarantee. The service
          does not replace a person in emergencies or for medical or legal
          matters.
        </p>

        <h2>6. Numbers</h2>
        <p>
          The Hungarian number is assigned, not owned. Carrier rules and identity
          checks (KYC) apply. Forwarding charges from your own carrier are yours
          to pay.
        </p>

        <h2>7. Acceptable use</h2>
        <p>
          No unlawful, deceptive or harassing use. Outbound calling is out of
          scope.
        </p>

        <h2>8. Liability</h2>
        <p>
          Cap at fees paid in the last 12 months (zero during the beta). No
          liability for missed calls, carrier outages or AI errors, except where
          the law does not allow excluding it (intent, gross negligence, harm to
          life or health).
        </p>

        <h2>9. Suspension and termination</h2>
        <p>
          We may suspend or terminate for breach. Account data is deleted within
          30 days of closing the account.
        </p>

        <h2>10. Prices</h2>
        <p>
          No payments yet. Prices and tax note (e.g. VAT-exempt under Hungarian
          rules) will appear here at paid launch.
        </p>

        <h2>11. Law, courts, language, changes</h2>
        <p>
          Hungarian law, courts of Budapest. Hungarian text prevails. Material
          changes are announced at least 15 days ahead.
        </p>

        <h2>12. Data processing</h2>
        <p>
          The <a href="/en/dpa">Data Processing Terms</a> are incorporated by
          reference.
        </p>
      </section>

      <p style={{ marginTop: 32 }}>
        <a href="/">← Dial Hanna</a>
      </p>
    </main>
  );
}
