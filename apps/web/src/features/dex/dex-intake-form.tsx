"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DEX_VISITOR_ROLE_LABEL,
  DEX_VISITOR_ROLES,
  type DexVisitorRole,
} from "@/lib/dex/intake-shared";

const FIELD_LABEL = "text-micro font-mono uppercase tracking-[0.1em] text-faint";
const FIELD_INPUT =
  "mt-1 w-full rounded-md border border-border bg-recessed px-3 py-2 text-small text-ink outline-none focus:border-accent";

export function DexIntakeForm({
  onDone,
}: {
  onDone: (status: "submitted" | "skipped", role?: DexVisitorRole) => void;
}) {
  const [role, setRole] = useState<DexVisitorRole | "">("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const canSubmit = role !== "" && name.trim().length > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(false);
    try {
      const response = await fetch("/api/dex/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, name, company, contact, reason }),
      });
      if (!response.ok) throw new Error("intake save failed");
      onDone("submitted", role);
    } catch {
      setError(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <p className="text-small text-ink">
        Quick intro before you chat with Dex — helps Deepak see who&apos;s
        actually visiting. Totally optional.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="dex-intake-role" className={FIELD_LABEL}>
            Who are you? *
          </label>
          <select
            id="dex-intake-role"
            value={role}
            onChange={(event) => setRole(event.target.value as DexVisitorRole)}
            className={FIELD_INPUT}
          >
            <option value="" disabled>
              Select one
            </option>
            {DEX_VISITOR_ROLES.map((value) => (
              <option key={value} value={value}>
                {DEX_VISITOR_ROLE_LABEL[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dex-intake-name" className={FIELD_LABEL}>
            Name *
          </label>
          <input
            id="dex-intake-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={200}
            className={FIELD_INPUT}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="dex-intake-company" className={FIELD_LABEL}>
              Company
            </label>
            <input
              id="dex-intake-company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              maxLength={200}
              className={FIELD_INPUT}
            />
          </div>
          <div>
            <label htmlFor="dex-intake-contact" className={FIELD_LABEL}>
              Contact
            </label>
            <input
              id="dex-intake-contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="Email or LinkedIn"
              maxLength={200}
              className={FIELD_INPUT}
            />
          </div>
        </div>

        <div>
          <label htmlFor="dex-intake-reason" className={FIELD_LABEL}>
            What brings you here?
          </label>
          <input
            id="dex-intake-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            className={FIELD_INPUT}
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-micro text-faint">
          Couldn&apos;t save that just now — you can still continue to chat.
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onDone("skipped")}
          className="text-small text-faint underline-offset-4 hover:text-muted hover:underline"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!canSubmit}
          className={cn(
            "rounded-md bg-accent px-4 py-2 text-small text-on-accent transition-colors duration-(--duration-fast)",
            "hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          {submitting ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
