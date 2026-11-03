"use client";

import { useState, type ComponentType } from "react";
import {
  Scissors,
  Car,
  Wrench,
  Truck,
  Building2,
  Dumbbell,
  Camera,
  PawPrint,
  Briefcase,
  UtensilsCrossed,
  Flower2,
  GraduationCap,
  type LucideProps,
} from "lucide-react";
import { calculate, formatHuf } from "@/lib/calculator.ts";
import {
  waitlistHref,
  landing,
  scenarios,
  type LandingDict,
  type Lang,
} from "@/i18n/landing.ts";

const VERTICAL_ICONS: Record<string, ComponentType<LucideProps>> = {
  "hajszalon": Scissors,
  "auto-gumiszerviz": Car,
  "szakipar": Wrench,
  "koltoztetes-takaritas": Truck,
  "panzio-apartman": Building2,
  "edzok-studiok": Dumbbell,
  "fotos-rendezveny": Camera,
  "kutya-kozmetika": PawPrint,
  "vendeglatas": UtensilsCrossed,
  "virag-ajandek": Flower2,
  "nyelviskola-magantanar": GraduationCap,
  "szabaduszok-maganszemelyek": Briefcase,
};

const INK = "#0C1C20";
const PANEL = "#0E2A30";
const PANEL2 = "#163A42";
const AMBER = "#FFB62E";
const GREEN = "#3DDC97";
const DEEP_GREEN = "#0B5D3F";
const MUTED = "#3E5157";
const LINE = "#D8DDD6";
const CARD = "#FFFFFF";

const fmtNum = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

function Section({
  id,
  title,
  sub,
  children,
}: {
  id: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="section">
      <h2 className="section-title">{title}</h2>
      {sub && <p className="section-sub">{sub}</p>}
      {children}
    </section>
  );
}

function Transcript({
  lines,
  compact,
}: {
  lines: { who: string; text: string; hanna: boolean }[];
  compact?: boolean;
}) {
  return (
    <div className={compact ? "transcript transcript-compact" : "transcript"}>
      {lines.map((l, i) => (
        <div
          key={i}
          className={l.hanna ? "bubble bubble-hanna" : "bubble bubble-caller"}
        >
          <span className="bubble-who">{l.who}</span>
          <p className="bubble-text">{l.text}</p>
        </div>
      ))}
    </div>
  );
}

function OutcomeCard({
  d,
  sc,
}: {
  d: LandingDict;
  sc: { chip: string; chipBg: string; chipFg: string; intent: string; outcome: string; next: string };
}) {
  return (
    <div className="outcome">
      <span className="chip" style={{ background: sc.chipBg, color: sc.chipFg }}>
        {sc.chip}
      </span>
      <dl>
        <div>
          <dt>{d.hero.intent}</dt>
          <dd>{sc.intent}</dd>
        </div>
        <div>
          <dt>{d.hero.outcome}</dt>
          <dd>{sc.outcome}</dd>
        </div>
        <div>
          <dt>{d.hero.next}</dt>
          <dd>{sc.next}</dd>
        </div>
      </dl>
    </div>
  );
}

function Hero({ d, lang }: { d: LandingDict; lang: Lang }) {
  const sc = scenarios[lang][0];
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">{d.hero.eyebrow}</p>
        <h1>
          {d.hero.titleA}
          <br />
          <span className="title-accent">{d.hero.titleB}</span>
        </h1>
        <p className="lede">{d.hero.sub}</p>
        <p className="cta-row">
          <a className="btn btn-primary" href={waitlistHref(lang)}>
            {d.hero.primary}
          </a>
          <a className="btn btn-ghost" href="#how">
            {d.hero.secondary}
          </a>
        </p>
        <p className="trust">{d.hero.trust}</p>
      </div>
      <div className="hero-panel">
        <p className="panel-caption mono">
          {d.hero.panelCaption} · {d.hero.panelBiz}
        </p>
        <Transcript lines={sc.lines.slice(0, 3)} compact />
        <p className="panel-after">
          {d.hero.afterTitle}
        </p>
        <OutcomeCard d={d} sc={sc} />
        <p className="panel-note">{d.hero.demoNote}</p>
      </div>
    </section>
  );
}

function Values({ d }: { d: LandingDict }) {
  return (
    <section className="values" aria-label={d.valuesTitle}>
      {d.values.map((v, i) => (
        <div key={v.title} className="value">
          <span className="value-num mono">0{i + 1}</span>
          <h3>{v.title}</h3>
          <p>{v.body}</p>
        </div>
      ))}
    </section>
  );
}

function HowItWorks({ d }: { d: LandingDict }) {
  return (
    <Section id="how" title={d.howTitle} sub={d.howSub}>
      <ol className="steps">
        {d.steps.map((s, i) => (
          <li key={s.title} className="step">
            <span className="step-num mono">0{i + 1}</span>
            <div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              {s.code && (
                <p className="ussd">
                  <code className="mono">{s.code}</code>{" "}
                  <span className="muted">{s.codeNote}</span>
                </p>
              )}
              {s.extra && (
                <p>
                  <span className="chip chip-ink">{s.extra}</span>
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="verify">
        <strong>{d.verifyTitle}</strong> {d.verifyBody}
      </p>
    </Section>
  );
}

function CallTabs({ d, lang }: { d: LandingDict; lang: Lang }) {
  const [tab, setTab] = useState(0);
  const list = scenarios[lang];
  return (
    <Section id="get" title={d.getTitle} sub={d.getSub}>
      <p className="section-note">{d.tabsNote}</p>
      <div className="tabs" role="tablist">
        {list.map((s, i) => (
          <button
            key={s.label}
            type="button"
            role="tab"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={tab === i ? "tab active" : "tab"}
          >
            {s.label}
          </button>
        ))}
      </div>
      {/* Stack every scenario in one grid cell so height stays stable when switching tabs. */}
      <div className="call-stage">
        {list.map((sc, i) => (
          <div
            key={sc.label}
            className={i === tab ? "call-grid is-active" : "call-grid"}
            role="tabpanel"
            aria-hidden={i !== tab}
          >
            <div className="call-panel">
              <p className="panel-caption mono">
                {d.callLabel} · {sc.biz}
              </p>
              <Transcript lines={sc.lines} />
            </div>
            <div className="call-side">
              <p className="panel-after">{d.afterDash}</p>
              <OutcomeCard d={d} sc={sc} />
              <p className="muted small">{d.hero.demoNote}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function OwnerGrid({ d }: { d: LandingDict }) {
  return (
    <Section id="control" title={d.ownerTitle} sub={d.ownerSub}>
      <ol className="owner-grid">
        {d.ownerTiles.map((tile, i) => (
          <li key={tile.title} className="owner-card">
            <span className="step-num mono">0{i + 1}</span>
            <h3>{tile.title}</h3>
            <p>{tile.body}</p>
          </li>
        ))}
      </ol>
      <p className="verify">
        <strong>{d.versionsBand}</strong>
      </p>
    </Section>
  );
}

function Verticals({ d }: { d: LandingDict }) {
  return (
    <Section id="industries" title={d.industriesTitle} sub={d.industriesSub}>
      <div className="verticals">
        {d.verticals.map((v) => {
          const Icon = VERTICAL_ICONS[v.slug] ?? Briefcase;
          return (
            <article key={v.slug} className="vertical">
              <div className="vertical-icon" aria-hidden>
                <Icon size={22} strokeWidth={1.75} />
              </div>
              <h3>{v.name}</h3>
              <p>{v.pain}</p>
              <p className="vertical-does">
                <strong>{d.hannaDoes}</strong> {v.does}
              </p>
            </article>
          );
        })}
      </div>
      <p className="muted">{d.industriesNote}</p>
      <div className="bespoke-band">
        <div>
          <h3>{d.bespokeTitle}</h3>
          <p>{d.bespokeBody}</p>
        </div>
        <p>
          <a
            className="btn btn-primary"
            href="mailto:hello@dialhanna.com?subject=Egyedi%20ig%C3%A9ny%20%2F%20Bespoke%20request"
          >
            {d.bespokeCta}
          </a>
        </p>
      </div>
    </Section>
  );
}

function Calc({ d, lang }: { d: LandingDict; lang: Lang }) {
  const [calls, setCalls] = useState(20);
  const [share, setShare] = useState(10);
  const [avg, setAvg] = useState(15000);
  const r = calculate({ avgJobHuf: avg, missedPerWeek: calls, payingSharePct: share });
  const ordersTxt = String(r.jobsPerMonth).replace(".", ",");
  const ok = r.jobsPerMonth >= r.jobsToCoverPlan;
  return (
    <Section id="calc" title={d.calcTitle} sub={d.calcSub}>
      <div className="calc-grid">
        <div className="calc-inputs">
          <label>
            {d.calc.calls}: <strong>{d.calc.callsUnit(calls)}</strong>
            <input type="range" min={1} max={40} value={calls}
              onChange={(e) => setCalls(Number(e.target.value))} />
          </label>
          <label>
            {d.calc.share}: <strong>{share} %</strong>
            <input type="range" min={5} max={100} step={5} value={share}
              onChange={(e) => setShare(Number(e.target.value))} />
          </label>
          <label>
            {d.calc.avg}: <strong>{lang === "hu" ? formatHuf(avg) : `${fmtNum(avg)} HUF`}</strong>
            <input type="range" min={3000} max={150000} step={1000} value={avg}
              onChange={(e) => setAvg(Number(e.target.value))} />
          </label>
        </div>
        <div className="calc-result">
          <p className="muted small">{d.calc.revenue}</p>
          <p className="calc-rev">{lang === "hu" ? formatHuf(r.extraRevenueHuf) : `${fmtNum(r.extraRevenueHuf)} HUF`}</p>
          <p>
            {d.calc.orders}: <strong>{ordersTxt} {d.calc.ordersUnit}</strong>
          </p>
          <p>
            {d.calc.need(lang === "hu" ? formatHuf(r.planHuf) : `${fmtNum(r.planHuf)} HUF`)}{" "}
            <strong>{r.jobsToCoverPlan} {d.calc.needUnit}</strong>
          </p>
          <p className={ok ? "verdict ok" : "verdict"}>
            {ok ? d.calc.verdictOk(ordersTxt, r.jobsToCoverPlan) : d.calc.verdictShort(ordersTxt, r.jobsToCoverPlan)}
          </p>
        </div>
      </div>
      <p className="muted small calc-note">
        {d.calcDisclaimer}
      </p>
      <p className="muted small calc-note">{d.calc.formula}</p>
    </Section>
  );
}

function Pricing({ d, lang }: { d: LandingDict; lang: Lang }) {
  const [annual, setAnnual] = useState(false);
  return (
    <Section id="pricing" title={d.pricingTitle} sub={d.pricingSub}>
      <p className="muted">{d.pricingNote}</p>
      <div className="toggles" role="group" aria-label={`${d.monthly} / ${d.annual}`}>
        <button onClick={() => setAnnual(false)} aria-pressed={!annual} className={annual ? "toggle" : "toggle active"}>
          {d.monthly}
        </button>
        <button onClick={() => setAnnual(true)} aria-pressed={annual} className={annual ? "toggle active" : "toggle"}>
          {d.annual} · {d.annualDeal}
        </button>
      </div>
      <div className="plans">
        {d.plans.map((p) => {
          const v = annual ? p.annual : p.monthly;
          const price = fmtNum(v);
          const unit = annual ? d.perYear : d.perMonth;
          return (
            <article key={p.name} className={p.badge ? "plan featured" : "plan"}>
              <div className="plan-head">
                <h3>{p.name}</h3>
                {p.badge && <span className="chip chip-amber">{p.badge}</span>}
              </div>
              <p className="plan-tag">{p.tag}</p>
              <p className="plan-price">
                {price} {unit}
              </p>
              {annual && (
                <p className="muted small">
                  ≈ {fmtNum(v / 12)} {d.perMonthApprox}
                </p>
              )}
              {!annual && <p className="muted small">{d.billedMonthly}</p>}
              <p className="plan-minutes mono">{p.minutes}</p>
              <ul>
                {p.feats.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="plan-cta">
                <a
                  className={p.badge ? "btn btn-light" : "btn btn-outline"}
                  href={waitlistHref(lang, p.name)}
                >
                  {p.cta}
                </a>
              </p>
            </article>
          );
        })}
      </div>
      <div className="fineprint">
        <p>
          <strong>{d.trialTitle}</strong> {d.trialBody}
        </p>
        <p>
          <strong>{d.overageTitle}</strong> {d.overageBody}
        </p>
      </div>
    </Section>
  );
}

function Faq({ d }: { d: LandingDict }) {
  const [open, setOpen] = useState(0);
  return (
    <Section id="faq" title={d.faqTitle} sub={d.faqSub}>
      <div className="faq">
        {d.faq.map((f, i) => (
          <div key={f.q} className="faq-item">
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
              className="faq-q"
            >
              <span aria-hidden>{open === i ? "−" : "+"}</span> {f.q}
            </button>
            {open === i && <p className="faq-a">{f.a}</p>}
          </div>
        ))}
      </div>
    </Section>
  );
}

function Final({ d, lang }: { d: LandingDict; lang: Lang }) {
  return (
    <section className="final">
      <h2>{d.finalTitle}</h2>
      <p>{d.finalSub}</p>
      <p className="cta-row">
        <a className="btn btn-amber" href={waitlistHref(lang)}>
          {d.hero.primary}
        </a>
        <a className="btn btn-ghost-light" href="#how">
          {d.hero.secondary}
        </a>
      </p>
    </section>
  );
}

function Footer({ d, lang }: { d: LandingDict; lang: Lang }) {
  const prefix = lang === "en" ? "/en" : "";
  return (
    <footer className="footer">
      <div className="footer-top">
        <p className="footer-credit muted small">
          <strong className="footer-name">Dial Hanna</strong>
          {" · "}
          {d.footerRights} {d.footerCraftPrefix}
          <a
            href="https://www.vibecoderslife.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-vcl"
          >
            {d.footerCraftLink}
          </a>
        </p>
        <nav className="footer-nav" aria-label="footer">
          <a href={`${prefix}/privacy`}>{d.privacy}</a>
          <a href={`${prefix}/terms`}>{d.terms}</a>
          <a href={`${prefix}/dpa`}>{d.dpa}</a>
          <a href="mailto:hello@dialhanna.com">{d.contact}</a>
          <a href="/api/health">{d.footerStatus}</a>
        </nav>
      </div>
    </footer>
  );
}

export default function Landing({ lang }: { lang: Lang }) {
  // Resolve dict inside the client boundary — LandingDict embeds helpers
  // (callsUnit, verdictOk, …) that cannot cross the RSC → client prop bridge.
  const d = landing[lang];
  return (
    <div className="landing">
      <Hero d={d} lang={lang} />
      <Values d={d} />
      <HowItWorks d={d} />
      <CallTabs d={d} lang={lang} />
      <OwnerGrid d={d} />
      <Verticals d={d} />
      <Calc d={d} lang={lang} />
      <Pricing d={d} lang={lang} />
      <Faq d={d} />
      <Final d={d} lang={lang} />
      <Footer d={d} lang={lang} />
    </div>
  );
}

export { INK, PANEL, PANEL2, AMBER, GREEN, DEEP_GREEN, MUTED, LINE, CARD };
