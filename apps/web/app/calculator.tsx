"use client";

import { useState } from "react";
import { calculate, formatHuf } from "@/lib/calculator.ts";

export default function Calculator() {
  const [avg, setAvg] = useState(15000);
  const [missed, setMissed] = useState(5);
  const [share, setShare] = useState(20);
  const r = calculate({ avgJobHuf: avg, missedPerWeek: missed, payingSharePct: share });
  return (
    <div>
      <label style={{ display: "block", marginBottom: 12 }}>
        Átlagos munkadíj / munka: <strong>{formatHuf(avg)}</strong>
        <input type="range" min={2000} max={100000} step={1000} value={avg}
          onChange={(e) => setAvg(Number(e.target.value))} style={{ display: "block", width: "100%" }} />
      </label>
      <label style={{ display: "block", marginBottom: 12 }}>
        Heti nem fogadott hívás: <strong>{missed} db / hét</strong>
        <input type="range" min={1} max={30} value={missed}
          onChange={(e) => setMissed(Number(e.target.value))} style={{ display: "block", width: "100%" }} />
      </label>
      <label style={{ display: "block", marginBottom: 16 }}>
        Ebből fizető munka lenne (saját becslésed): <strong>{share} %</strong>
        <input type="range" min={5} max={100} step={5} value={share}
          onChange={(e) => setShare(Number(e.target.value))} style={{ display: "block", width: "100%" }} />
      </label>
      <p style={{ fontSize: 20, margin: "8px 0" }}>
        Becsült havi többletbevétel: <strong>{formatHuf(r.extraRevenueHuf)}</strong>
      </p>
      <p style={{ margin: "4px 0" }}>
        Ennyi új munka fedezi a Pro havidíjat ({formatHuf(r.planHuf)}):{" "}
        <strong>{r.jobsToCoverPlan} db / hó</strong>
      </p>
      <p style={{ fontSize: 13, color: "#555" }}>
        Szemléltető becslés a saját számaidból — nem ígéret: ez bevétel, nem nyereség,
        az anyag- és munkaköltséget nem tartalmazza.
      </p>
    </div>
  );
}
