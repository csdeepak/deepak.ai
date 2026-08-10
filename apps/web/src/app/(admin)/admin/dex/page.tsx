import type { Metadata } from "next";
import Link from "next/link";
import {
  getDexStats,
  listUnansweredQuestions,
  listRefusedQuestions,
  listTopQuestions,
  listRoleBreakdown,
  listVisitors,
} from "@/features/admin/queries/dex";
import { DEX_VISITOR_ROLE_LABEL, isDexVisitorRole } from "@/lib/dex/intake-shared";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dex" };

export default async function DexAdminPage() {
  const [stats, unanswered, refused, topQuestions, roles, visitors] = await Promise.all([
    getDexStats(),
    listUnansweredQuestions(),
    listRefusedQuestions(),
    listTopQuestions(),
    listRoleBreakdown(),
    listVisitors(),
  ]);

  const roleTotal = roles.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h3 font-semibold text-ink">Dex</h1>
          <p className="mt-1 text-small text-muted">
            Cached recall assistant — file-backed knowledge, zero public model calls.
          </p>
        </div>
        <div className="flex gap-2">
          <ExportLink type="visitors" label="Visitors CSV" />
          <ExportLink type="questions" label="Questions CSV" />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-4">
        <StatCard label="Visitors" value={String(stats.visitors)} />
        <StatCard label="Questions asked" value={String(stats.questions)} />
        <StatCard
          label="Answered from memory"
          value={stats.answerRate === null ? "—" : `${stats.answerRate}%`}
          alert={
            stats.answerRate === null
              ? undefined
              : stats.answerRate >= 80
                ? "green"
                : stats.answerRate >= 50
                  ? "amber"
                  : "red"
          }
        />
        <StatCard
          label="Unanswered"
          value={String(stats.unanswered)}
          alert={stats.unanswered > 0 ? "amber" : "green"}
        />
      </div>

      {/* The actionable list: every row here is an FAQ worth writing. */}
      <Section
        title={`Gaps to fill (${unanswered.length})`}
        hint="Questions about Deepak that approved memory could not answer. Each one is a cached FAQ worth adding."
      >
        {unanswered.length === 0 ? (
          <Empty>No gaps yet — every question so far was answered from memory.</Empty>
        ) : (
          <QuestionTable rows={unanswered} />
        )}
      </Section>

      <Section
        title="Who is visiting"
        hint="Self-reported at the intake step. Visitors who skipped it are not counted here."
      >
        {roles.length === 0 ? (
          <Empty>No intake responses yet.</Empty>
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-md border border-border">
            {roles.map((row) => {
              const label = isDexVisitorRole(row.role)
                ? DEX_VISITOR_ROLE_LABEL[row.role]
                : row.role;
              const pct = roleTotal === 0 ? 0 : Math.round((row.count / roleTotal) * 100);
              return (
                <div key={row.role} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-56 shrink-0 text-small text-ink">{label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-recessed">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right text-small text-muted">
                    {row.count} · {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Most asked">
        {topQuestions.length === 0 ? (
          <Empty>No questions logged yet.</Empty>
        ) : (
          <QuestionTable rows={topQuestions} />
        )}
      </Section>

      <Section
        title={`Refused (${refused.length})`}
        hint="Blocked by the visitor-task guard. Check nothing legitimate about Deepak is being turned away."
      >
        {refused.length === 0 ? (
          <Empty>Nothing refused yet.</Empty>
        ) : (
          <QuestionTable rows={refused} />
        )}
      </Section>

      <Section title={`Recent visitors (${visitors.length})`}>
        {visitors.length === 0 ? (
          <Empty>No intake responses yet.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-border text-left text-micro uppercase tracking-[0.1em] text-faint">
                  <th className="px-4 py-2 font-medium">When</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Company</th>
                  <th className="px-4 py-2 font-medium">Contact</th>
                  <th className="px-4 py-2 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visitors.map((v) => (
                  <tr key={v.id}>
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted">
                      {v.createdAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-ink">{v.name}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted">
                      {isDexVisitorRole(v.role) ? DEX_VISITOR_ROLE_LABEL[v.role] : v.role}
                    </td>
                    <td className="px-4 py-2.5 text-muted">{v.company || "—"}</td>
                    <td className="px-4 py-2.5 text-muted">{v.contact || "—"}</td>
                    <td className="px-4 py-2.5 text-muted">{v.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <p className="mt-8 text-micro text-faint">
        Question logs record the question, the outcome, and the visitor&apos;s role — never
        their name or contact. Visitor identities and questions are stored separately and
        are never joined.
      </p>
    </div>
  );
}

function ExportLink({ type, label }: { type: "visitors" | "questions"; label: string }) {
  return (
    <Link
      href={`/admin/dex/export?type=${type}`}
      prefetch={false}
      className="inline-flex h-9 items-center rounded-md border border-border px-3 text-small text-muted hover:border-border-emphasis hover:text-ink"
    >
      {label}
    </Link>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-1 text-small font-semibold text-ink">{title}</h2>
      {hint && <p className="mb-3 text-micro text-faint">{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </section>
  );
}

function QuestionTable({
  rows,
}: {
  rows: Array<{ question: string; askCount: number; lastAskedAt: Date }>;
}) {
  return (
    <div className="flex flex-col divide-y divide-border rounded-md border border-border">
      {rows.map((row) => (
        <div key={row.question} className="flex items-center gap-3 px-4 py-2.5">
          <span className="flex-1 text-small text-ink">{row.question}</span>
          <span className="shrink-0 rounded bg-recessed px-1.5 py-0.5 text-micro text-muted">
            ×{row.askCount}
          </span>
          <span className="w-40 shrink-0 text-right text-micro text-faint">
            {row.lastAskedAt.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border px-4 py-6 text-center text-small text-muted">
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: "green" | "amber" | "red";
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="text-micro font-medium text-muted">{label}</div>
      <div
        className={cn(
          "mt-1 text-h4 font-semibold",
          alert === "red" ? "text-danger" : alert === "amber" ? "text-warning" : "text-ink",
        )}
      >
        {value}
      </div>
    </div>
  );
}
