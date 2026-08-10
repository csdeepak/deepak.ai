import "server-only";
import { getDb } from "@/db/index";
import { dexQuestionLog } from "@/db/schema";
import { isDexVisitorRole } from "./intake-shared";
import type { DexAnswer } from "./types";

/**
 * Records what a visitor asked and whether Dex could answer it (D-054).
 *
 * Privacy boundary (owner decision, 2026-07-31): the log stores the question,
 * the outcome, and the audience segment — never the visitor's name, contact,
 * or a foreign key back to dex_visitor_intake. Segment insight without a
 * per-person dossier.
 *
 * Never throws. A logging failure must not stop a visitor getting their
 * answer, so callers can await this without a guard of their own.
 */
export async function logDexQuestion(
  question: string,
  answer: DexAnswer,
  visitorRole: unknown,
): Promise<void> {
  const role = isDexVisitorRole(visitorRole) ? visitorRole : "";

  try {
    await getDb().insert(dexQuestionLog).values({
      question,
      answerKind: answer.kind,
      matchedQuestion: answer.matchedQuestion ?? "",
      visitorRole: role,
    });
  } catch (error) {
    console.error("Dex question log failed:", error);
  }
}
