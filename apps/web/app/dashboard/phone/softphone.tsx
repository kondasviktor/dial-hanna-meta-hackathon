"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Call, Device } from "@twilio/voice-sdk";

type Status = "idle" | "ready" | "connecting" | "open" | "error";
type SoftLang = "hu" | "en";

const COPY = {
  hu: {
    title: "Próbahívás a böngészőből",
    blurb:
      "Wi‑Fi-n hívod Hannát — nincs nemzetközi mobil díj. Engedélyezd a mikrofont, amikor a böngésző kéri.",
    preparing: "Softphone előkészítése…",
    readyDid: (did: string) => `Kész — ${did}`,
    ready: "Kész a Wi‑Fi híváshoz",
    callError: "Hívás hiba",
    setupFail: "Nem sikerült a próbahívás",
    connecting: "Kapcsolódás… (engedélyezd a mikrofont)",
    open: "Hívás folyamatban — beszélj Hannával",
    ended: "Hívás vége",
    cancelled: "Hívás megszakítva",
    rejected: "Hívás elutasítva",
    callFail: "Nem sikerült a hívás",
    call: "Hívd Hannát",
    hangup: "Bontás",
  },
  en: {
    title: "Browser softphone",
    blurb:
      "Call Hanna over Wi‑Fi — no international mobile charge. Allow the microphone when the browser asks.",
    preparing: "Preparing softphone…",
    readyDid: (did: string) => `Ready — ${did}`,
    ready: "Ready for a Wi‑Fi call",
    callError: "Call error",
    setupFail: "Could not set up the softphone",
    connecting: "Connecting… (allow the microphone)",
    open: "Call in progress — talk to Hanna",
    ended: "Call ended",
    cancelled: "Call cancelled",
    rejected: "Call rejected",
    callFail: "Could not place the call",
    call: "Call Hanna",
    hangup: "Hang up",
  },
} as const;

export default function Softphone({ did, lang = "hu" }: { did: string; lang?: SoftLang }) {
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  const t = COPY[lang];
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>(COPY[lang].preparing);
  const orgIdRef = useRef<string>("");

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
    const copy = COPY[lang];

    async function setup() {
      try {
        const res = await fetch("/api/twilio/token");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `token ${res.status}`);
        }
        const body = (await res.json()) as { token: string; orgId?: string | null };
        if (cancelled) return;
        orgIdRef.current = body.orgId?.trim() || "";

        const { Device: TwilioDevice, Call: TwilioCall } = await import("@twilio/voice-sdk");
        const device = new TwilioDevice(body.token, {
          codecPreferences: [TwilioCall.Codec.Opus, TwilioCall.Codec.PCMU],
          closeProtection: true,
        });
        device.on("error", (err) => {
          setStatus("error");
          setMessage(err.message || copy.callError);
        });
        deviceRef.current = device;
        setStatus("ready");
        setMessage(did ? copy.readyDid(did) : copy.ready);
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setMessage(e instanceof Error ? e.message : copy.setupFail);
      }
    }

    void setup();
    return () => {
      cancelled = true;
      teardown();
    };
  }, [did, teardown, lang]);

  useEffect(() => {
    if (status === "idle") setMessage(COPY[lang].preparing);
    else if (status === "ready") setMessage(did ? COPY[lang].readyDid(did) : COPY[lang].ready);
  }, [lang, did, status]);

  async function startCall() {
    const device = deviceRef.current;
    if (!device || status === "connecting" || status === "open") return;
    setStatus("connecting");
    setMessage(t.connecting);
    try {
      const params: Record<string, string> = { To: did || "hanna", Lang: lang };
      if (orgIdRef.current) params.OrgId = orgIdRef.current;
      const call = await device.connect({ params });
      callRef.current = call;
      call.on("accept", () => {
        setStatus("open");
        setMessage(t.open);
      });
      call.on("disconnect", () => {
        callRef.current = null;
        setStatus("ready");
        setMessage(t.ended);
      });
      call.on("cancel", () => {
        callRef.current = null;
        setStatus("ready");
        setMessage(t.cancelled);
      });
      call.on("reject", () => {
        callRef.current = null;
        setStatus("ready");
        setMessage(t.rejected);
      });
      call.on("error", (err) => {
        setStatus("error");
        setMessage(err.message || t.callError);
      });
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : t.callFail);
    }
  }

  function endCall() {
    callRef.current?.disconnect();
    deviceRef.current?.disconnectAll();
    callRef.current = null;
    setStatus("ready");
    setMessage(t.ended);
  }

  const busy = status === "connecting" || status === "open";
  const canCall = status === "ready";

  return (
    <div className="dash-card">
      <h2>{t.title}</h2>
      <p className="muted small">{t.blurb}</p>
      <p className="mono" style={{ margin: "12px 0" }}>
        {message}
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={!canCall}
          onClick={() => void startCall()}
        >
          {t.call}
        </button>
        {busy && (
          <button type="button" className="btn btn-outline btn-sm" onClick={endCall}>
            {t.hangup}
          </button>
        )}
      </div>
    </div>
  );
}
