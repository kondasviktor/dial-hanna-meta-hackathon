"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Call, Device } from "@twilio/voice-sdk";

type Status = "idle" | "ready" | "connecting" | "open" | "error";

export default function Softphone({ did }: { did: string }) {
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("Softphone előkészítése…");

  const teardown = useCallback(() => {
    try {
      callRef.current?.disconnect();
    } catch {
      /* ignore */
    }
    callRef.current = null;
    try {
      deviceRef.current?.destroy();
    } catch {
      /* ignore */
    }
    deviceRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const res = await fetch("/api/twilio/token");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `token ${res.status}`);
        }
        const { token } = (await res.json()) as { token: string };
        if (cancelled) return;

        const { Device: TwilioDevice, Call: TwilioCall } = await import("@twilio/voice-sdk");
        const device = new TwilioDevice(token, {
          codecPreferences: [TwilioCall.Codec.Opus, TwilioCall.Codec.PCMU],
          closeProtection: true,
        });
        device.on("error", (err) => {
          setStatus("error");
          setMessage(err.message || "Twilio softphone hiba");
        });
        deviceRef.current = device;
        setStatus("ready");
        setMessage(did ? `Kész — ${did}` : "Kész a Wi‑Fi híváshoz");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Nem sikerült a softphone");
      }
    }

    void setup();
    return () => {
      cancelled = true;
      teardown();
    };
  }, [did, teardown]);

  async function startCall() {
    const device = deviceRef.current;
    if (!device || status === "connecting" || status === "open") return;
    setStatus("connecting");
    setMessage("Kapcsolódás… (engedélyezd a mikrofont)");
    try {
      const call = await device.connect({ params: { To: did || "hanna" } });
      callRef.current = call;
      call.on("accept", () => {
        setStatus("open");
        setMessage("Hívás folyamatban — beszélj Hannával");
      });
      call.on("disconnect", () => {
        callRef.current = null;
        setStatus("ready");
        setMessage("Hívás vége");
      });
      call.on("cancel", () => {
        callRef.current = null;
        setStatus("ready");
        setMessage("Hívás megszakítva");
      });
      call.on("reject", () => {
        callRef.current = null;
        setStatus("ready");
        setMessage("Hívás elutasítva");
      });
      call.on("error", (err) => {
        setStatus("error");
        setMessage(err.message || "Hívási hiba");
      });
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Nem sikerült a hívás");
    }
  }

  function endCall() {
    callRef.current?.disconnect();
    deviceRef.current?.disconnectAll();
    callRef.current = null;
    setStatus("ready");
    setMessage("Hívás vége");
  }

  const busy = status === "connecting" || status === "open";

  return (
    <div className="dash-card">
      <h2>Böngésző softphone</h2>
      <p className="muted small">
        Wi‑Fi-n hívod Hannát — nincs nemzetközi mobil díj. Engedélyezd a
        mikrofont, amikor a böngésző kéri.
      </p>
      <p className="mono" style={{ margin: "12px 0" }}>
        {message}
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={status !== "ready"}
          onClick={() => void startCall()}
        >
          Hívd Hannát
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={!busy}
          onClick={endCall}
        >
          Bontás
        </button>
      </div>
    </div>
  );
}
