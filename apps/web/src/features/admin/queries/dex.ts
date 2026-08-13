/**
 * Dex analytics read queries for the admin (server-only, not Server Actions).
 *
 * Backs /admin/dex (D-054). Two independent sources:
 *   - dex_visitor_intake — who self-reported visiting
 *   - dex_question_log   — what was asked and whether Dex could answer it
 *
 * These are deliberately never joined: the question log carries no identity,
 * by owner decision (2026-07-31). Segment insight, not a per-person dossier.
 */

import "server-only";
import { sql, desc } from "drizzle-orm";
import { getDb } from "@/db/index";
import { dexVisitorIntake, dexQuestionLog } from "@/db/schema";

const askCount = sql<number>`count(*)`.mapWith(Number);
/** Case/whitespace-insensitive grouping key so "What is ASMOS?" dedupes. */
const questionKey = sql`lower(trim(${dexQuestionLog.question}))`;

export interface DexStats {
  visitors: number;
  questions: number;
  answered: number;
  unanswered: number;
  refused: number;
  /** Share of questions Dex answered from approved memory. null = none asked. */
  answerRate: number | null;
}

export interface DexQuestionGroup {
  question: string;
  askCount: number;
  lastAskedAt: Date;
}

export interface DexRoleCount {
  role: string;
  count: number;
}

export interface DexVisitorRow {
  id: string;
  role: string;
  name: string;
  company: string;
  contact: string;
  reason: string;
  createdAt: Date;
}

export async function getDexStats(): Promise<DexStats> {
  const db = getDb();

  const [questionRow] = await db
    .select({
      total: askCount,
      // 'generated' is Dex v2's LLM-backed answer (D-059) and counts as
      // answered. Without it here a generated reply fell through every
      // bucket — not answered, not unanswered, not refused — so the
      // answer-rate stat silently undercounted once v2 went live.
      answered: sql<number>`count(*) filter (where ${dexQuestionLog.answerKind} in ('generated','cached','knowledge'))`.mapWith(
        Number,
      ),
      unanswered: sql<number>`count(*) filter (where ${dexQuestionLog.answerKind} = 'unknown')`.mapWith(
        Number,
      ),
      refused: sql<number>`count(*) filter (where ${dexQuestionLog.answerKind} = 'refusal')`.mapWith(
        Number,
      ),
    })
    .from(dexQuestionLog);

  const [visitorRow] = await db
    .select({ total: askCount })
    .from(dexVisitorIntake);

  const questions = questionRow?.total ?? 0;
  const answered = questionRow?.answered ?? 0;

  return {
    visitors: visitorRow?.total ?? 0,
    questions,
    answered,
    unanswered: questionRow?.unanswered ?? 0,
    refused: questionRow?.refused ?? 0,
    answerRate: questions === 0 ? null : Math.round((answered / questions) * 100),
  };
}

/**
 * Questions about Deepak that the approved knowledge base could not answer,
 * most-asked first. This is the actionable list: each row is an FAQ worth
 * writing.
 */
export async function listUnansweredQuestions(limit = 25): Promise<DexQuestionGroup[]> {
  return groupQuestionsByKind("unknown", limit);
}

/** Questions the visitor-task guard refused — check it isn't over-refusing. */
export async function listRefusedQuestions(limit = 15): Promise<DexQuestionGroup[]> {
  return groupQuestionsByKind("refusal", limit);
}

/** What visitors actually ask most, across every outcome. */
export async function listTopQuestions(limit = 15): Promise<DexQuestionGroup[]> {
  const db = getDb();
  const rows = await db
    .select({
      question: sql<string>`min(${dexQuestionLog.question})`,
      askCount,
      lastAskedAt: sql<Date>`max(${dexQuestionLog.createdAt})`,
    })
    .from(dexQuestionLog)
    .groupBy(questionKey)
    .orderBy(desc(askCount))
    .limit(limit);

  return rows.map(normalizeGroup);
}

export async function listRoleBreakdown(): Promise<DexRoleCount[]> {
  const db = getDb();
  const rows = await db
    .select({ role: dexVisitorIntake.role, count: askCount })
    .from(dexVisitorIntake)
    .groupBy(dexVisitorIntake.role)
    .orderBy(desc(askCount));

  return rows.map((row) => ({ role: row.role, count: row.count }));
}

export async function listVisitors(limit = 100): Promise<DexVisitorRow[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(dexVisitorIntake)
    .orderBy(desc(dexVisitorIntake.createdAt))
    .limit(limit);

  return rows.map((row) => ({ ...row, createdAt: new Date(row.createdAt) }));
}

export async function listAllQuestions(limit = 500): Promise<
  Array<{
    question: string;
    answerKind: string;
    matchedQuestion: string;
    visitorRole: string;
    createdAt: Date;
  }>
> {
  const db = getDb();
  const rows = await db
    .select()
    .from(dexQuestionLog)
    .orderBy(desc(dexQuestionLog.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    question: row.question,
    answerKind: row.answerKind,
    matchedQuestion: row.matchedQuestion,
    visitorRole: row.visitorRole,
    createdAt: new Date(row.createdAt),
  }));
}

async function groupQuestionsByKind(
  kind: string,
  limit: number,
): Promise<DexQuestionGroup[]> {
  const db = getDb();
  const rows = await db
    .select({
      question: sql<string>`min(${dexQuestionLog.question})`,
      askCount,
      lastAskedAt: sql<Date>`max(${dexQuestionLog.createdAt})`,
    })
    .from(dexQuestionLog)
    .where(sql`${dexQuestionLog.answerKind} = ${kind}`)
    .groupBy(questionKey)
    .orderBy(desc(askCount))
    .limit(limit);

  return rows.map(normalizeGroup);
}

function normalizeGroup(row: {
  question: string;
  askCount: number;
  lastAskedAt: Date | string;
}): DexQuestionGroup {
  return {
    question: row.question,
    askCount: row.askCount,
    lastAskedAt: new Date(row.lastAskedAt),
  };
}
