import Link from "next/link";

export default function Stub({
  title,
  body,
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="stub-wrap">
      <h1 className="dash-title">{title ?? "Hamarosan"}</h1>
      <p className="muted">{body ?? "Ez a képernyő még készül."}</p>
      <p style={{ marginTop: 24 }}>
        <Link href="/dashboard">← Áttekintés</Link>
      </p>
    </div>
  );
}
