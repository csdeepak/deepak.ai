"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { DexIntakeForm } from "./dex-intake-form";
import {
  DEX_ROLE_TO_AUDIENCE,
  isDexVisitorRole,
  type DexVisitorRole,
} from "@/lib/dex/intake-shared";
import type {
  DexAnswer,
  DexAudience,
  DexSource,
  DexSuggestedQuestion,
} from "@/lib/dex/types";

const DEX_INTAKE_STORAGE_KEY = "dex-intake-status";
const DEX_ROLE_STORAGE_KEY = "dex-intake-role";

type Message =
  | { role: "visitor"; text: string }
  | { role: "dex"; text: string; kind: DexAnswer["kind"]; sources: DexSource[] };

const AUDIENCE_LABEL: Record<DexAudience, string> = {
  collaborator: "Collaborator",
  general: "General",
  recruiter: "Recruiter",
  student: "Student",
  technical: "Technical",
};

/**
 * Dex Panel - D-053.
 *
 * v1 is cached recall, not live RAG: every public answer comes from approved
 * FAQ/cache data or a public knowledge card. No visitor prompt can call a
 * model in this version.
 */
export function DexPanel() {
  const open = useUiStore((s) => s.dexOpen);
  const closeOverlays = useUiStore((s) => s.closeOverlays);
  const [suggested, setSuggested] = useState<DexSuggestedQuestion[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [intakeStatus, setIntakeStatus] = useState<"submitted" | "skipped" | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(DEX_INTAKE_STORAGE_KEY);
    return stored === "submitted" || stored === "skipped" ? stored : null;
  });
  const intakePending = intakeStatus === null;
  const [visitorRole, setVisitorRole] = useState<DexVisitorRole | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(DEX_ROLE_STORAGE_KEY);
    return isDexVisitorRole(stored) ? stored : null;
  });

  const resolveIntake = (status: "submitted" | "skipped", role?: DexVisitorRole) => {
    window.localStorage.setItem(DEX_INTAKE_STORAGE_KEY, status);
    setIntakeStatus(status);
    if (role) {
      window.localStorage.setItem(DEX_ROLE_STORAGE_KEY, role);
      setVisitorRole(role);
    }
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/dex/suggested")
      .then((response) => response.json())
      .then((json: { questions?: DexSuggestedQuestion[] }) => {
        if (!cancelled) setSuggested(json.questions ?? []);
      })
      .catch(() => {
        if (!cancelled) setSuggested([]);
      });

    const focus = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => {
      cancelled = true;
      window.clearTimeout(focus);
    };
  }, [open]);

  // Ordered [label, questions] pairs. When the visitor told us who they are,
  // their own audience leads — presentation order only, nothing is hidden.
  const suggestedGroups = useMemo(() => {
    const groups = suggested.reduce<Record<string, DexSuggestedQuestion[]>>(
      (acc, item) => {
        const label = AUDIENCE_LABEL[item.audience] ?? "General";
        acc[label] = [...(acc[label] ?? []), item];
        return acc;
      },
      {},
    );

    const preferred = visitorRole
      ? AUDIENCE_LABEL[DEX_ROLE_TO_AUDIENCE[visitorRole]]
      : null;

    return Object.entries(groups).sort(([a], [b]) => {
      if (a === preferred) return -1;
      if (b === preferred) return 1;
      return 0;
    });
  }, [suggested, visitorRole]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || loading) return;
    setMessages((current) => [...current, { role: "visitor", text }]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("/api/dex/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, role: visitorRole ?? undefined }),
      });
      if (!response.ok) throw new Error("Dex answer request failed");
      const answer = (await response.json()) as DexAnswer;
      setMessages((current) => [
        ...current,
        {
          role: "dex",
          text: answer.answer,
          kind: answer.kind,
          sources: answer.sources,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "dex",
          text: "Dex is resting right now. Everything I know is still on the site.",
          kind: "unknown",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && closeOverlays()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-scrim) bg-scrim" />
        <Dialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-(--z-overlay) flex max-h-[88svh] flex-col rounded-t-lg border-t border-border bg-raised/95 shadow-overlay backdrop-blur-xl",
            "md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-full md:max-w-[30rem] md:rounded-none md:border-l md:border-t-0",
          )}
          aria-describedby="dex-scope"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="dl-breathe size-2.5 shrink-0 rounded-full bg-accent shadow-[0_0_16px_var(--interactive-default)]"
                aria-hidden
              />
              <div className="min-w-0">
                <Dialog.Title className="text-body font-medium text-ink">
                  Dex
                </Dialog.Title>
                <p id="dex-scope" className="truncate font-mono text-micro text-faint">
                  Recalls approved memories about Deepak only.
                </p>
              </div>
            </div>
            <Dialog.Close
              className="rounded-md p-2 text-faint transition-colors duration-(--duration-fast) hover:bg-surface hover:text-ink"
              aria-label="Close Dex"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {intakePending ? (
              <DexIntakeForm onDone={resolveIntake} />
            ) : (
              <>
                <div className="rounded-md border border-border bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                    <p className="text-small text-muted">
                      Ask about Deepak&apos;s projects, skills, experience, research
                      direction, or tools. I decline anything outside that memory.
                    </p>
                  </div>
                </div>

                {messages.length === 0 && suggestedGroups.length > 0 && (
                  <div className="mt-6 space-y-5">
                    {suggestedGroups.map(([audience, questions]) => (
                      <section key={audience} aria-labelledby={`dex-${audience}`}>
                        <h3
                          id={`dex-${audience}`}
                          className="font-mono text-micro uppercase tracking-[0.14em] text-faint"
                        >
                          {audience}
                        </h3>
                        <div className="mt-2 space-y-2">
                          {questions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => void ask(item.question)}
                              className="w-full rounded-md border border-border bg-recessed px-4 py-3 text-left text-small text-muted transition-colors duration-(--duration-fast) hover:border-border-emphasis hover:text-ink"
                            >
                              {item.question}
                            </button>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}

                {messages.length > 0 && (
                  <div className="mt-6 space-y-4" aria-live="polite">
                    {messages.map((message, index) =>
                      message.role === "visitor" ? (
                        <div key={index} className="flex justify-end">
                          <p className="max-w-[82%] rounded-md bg-accent px-4 py-3 text-small text-on-accent">
                            {message.text}
                          </p>
                        </div>
                      ) : (
                        <div key={index} className="rounded-md border border-border bg-surface p-4">
                          <p className="whitespace-pre-line text-small text-ink">
                            {message.text}
                          </p>
                          {message.sources.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {message.sources.map((source) =>
                                source.href ? (
                                  <a
                                    key={source.id}
                                    href={source.href}
                                    className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.72rem] text-muted transition-colors hover:border-border-emphasis hover:text-ink"
                                  >
                                    {source.label}
                                  </a>
                                ) : (
                                  <span
                                    key={source.id}
                                    className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.72rem] text-faint"
                                  >
                                    {source.label}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                    {loading && (
                      <p className="font-mono text-micro text-faint">Dex is checking memory...</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {!intakePending && (
            <form
              className="border-t border-border p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void ask(query);
              }}
            >
              <label htmlFor="dex-question" className="sr-only">
                Ask Dex about Deepak
              </label>
              <div className="flex items-center gap-2 rounded-md border border-border bg-recessed p-2 focus-within:border-accent">
                <input
                  ref={inputRef}
                  id="dex-question"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ask about Deepak..."
                  maxLength={360}
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 text-body text-ink outline-none placeholder:text-faint"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-on-accent transition-colors duration-(--duration-fast) hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Ask Dex"
                >
                  <Send className="size-4" aria-hidden />
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
