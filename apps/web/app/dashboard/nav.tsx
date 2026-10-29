"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Áttekintés", exact: true },
  { href: "/dashboard/calls", label: "Hívások", exact: false },
  { href: "/dashboard/gaps", label: "Tudásrések", exact: false, badge: true },
  { href: "/dashboard/kb", label: "Tudásbázis", exact: false },
  { href: "/dashboard/versions", label: "Verziók", exact: false },
  { href: "/dashboard/staff", label: "Munkatársak", exact: false },
  { href: "/dashboard/phone", label: "Telefon", exact: false },
  { href: "/dashboard/usage", label: "Használat és csomag", exact: false },
  { href: "/dashboard/settings", label: "Beállítások", exact: false },
];

export default function DashNav({ openGaps }: { openGaps: number | null }) {
  const pathname = usePathname();
  const [hannaOn, setHannaOn] = useState(true);
  return (
    <aside className="dash-side">
      <div className="dash-org">
        <strong>Szalon Viola</strong>
        <span>szépségszalon · demó</span>
        <span className="dash-live">Élő · v7</span>
      </div>
      <nav aria-label="dashboard">
        {NAV.map((n) => {
          const on = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={on ? "dash-link on" : "dash-link"} aria-current={on ? "page" : undefined}>
              {n.label}
              {n.badge && openGaps != null && openGaps > 0 && (
                <span className="dash-count">{openGaps}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="dash-hanna">
        <button
          type="button"
          role="switch"
          aria-checked={hannaOn}
          onClick={() => setHannaOn(!hannaOn)}
          className={hannaOn ? "hanna-switch on" : "hanna-switch"}
        >
          <span className="hanna-knob" aria-hidden />
          <span className="hanna-switch-label">
            {hannaOn ? "Hanna fogadja a hívásokat" : "Hanna szünetel"}
          </span>
        </button>
        <p>
          {hannaOn
            ? "Az átirányított hívásokat Hanna veszi fel."
            : "Az átirányítás marad, a hívásokat most nem veszi fel Hanna."}
        </p>
      </div>
    </aside>
  );
}
