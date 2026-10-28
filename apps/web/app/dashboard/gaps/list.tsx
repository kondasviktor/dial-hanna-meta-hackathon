"use client";

export default function GapsList({
  gaps,
  answerGap,
}: {
  gaps: { id: string; question: string; context: string | null; status: string }[];
  answerGap: (formData: FormData) => Promise<void>;
}) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 96px", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <p><a href="/dashboard">← Irányítópult</a></p>
      <h1>Tudásrések</h1>
      <p style={{ color: "#555" }}>Amit Hanna nem tudott: egy mondattal megválaszolod, ő legközelebb már tudja.</p>
      {gaps.length === 0 && <p>Nincs nyitott tudásrés.</p>}
      {gaps.map((g) => (
        <div key={g.id} style={{ borderTop: "1px solid #ddd", padding: "16px 0" }}>
          <strong>{g.question}</strong>
          <div style={{ fontSize: 14, color: "#555" }}>{g.status}{g.context ? ` · ${g.context}` : ""}</div>
          {g.status === "open" && (
            <form action={answerGap} style={{ marginTop: 8 }}>
              <input type="hidden" name="gapId" value={g.id} />
              <input name="answer" required placeholder="Válasz egy mondatban…" style={{ width: "70%", padding: 8 }} />
              <button type="submit" style={{ marginLeft: 8, padding: "8px 16px" }}>Mentés</button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}
