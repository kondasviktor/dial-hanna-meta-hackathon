import Link from "next/link";

const NAV = [
  { href: "/dashboard", label: "Áttekintés", exact: true },
  { href: "/dashboard/gaps", label: "Tudásrések", exact: false },
  { href: "/dashboard/versions", label: "Teszt és verziók", exact: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash-shell">
      <aside className="dash-side">
        <div className="dash-org">
          <strong>Szalon Viola</strong>
          <span>szépségszalon · demó</span>
        </div>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="dash-link">
            {n.label}
          </Link>
        ))}
        <div className="dash-hanna">
          <span className="hanna-pill">
            <span className="hanna-dot" aria-hidden />
            Hanna bekapcsolva
          </span>
          <p>Élő verzió fogadja az átirányított hívásokat.</p>
        </div>
      </aside>
      <div className="dash-main">{children}</div>
    </div>
  );
}
