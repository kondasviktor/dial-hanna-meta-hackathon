"use client";

import { useTransition } from "react";

export default function DeleteGapButton({
  gapId,
  label,
  confirmMessage,
  action,
}: {
  gapId: string;
  label: string;
  confirmMessage: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      disabled={pending}
      style={{ marginTop: 8 }}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        const fd = new FormData();
        fd.set("gapId", gapId);
        start(() => {
          void action(fd);
        });
      }}
    >
      {label}
    </button>
  );
}
