"use client";

import { useTransition } from "react";

export default function DeleteAllFaqsButton({
  label,
  confirmMessage,
  action,
}: {
  label: string;
  confirmMessage: string;
  action: () => Promise<void>;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        start(() => {
          void action();
        });
      }}
    >
      {label}
    </button>
  );
}
