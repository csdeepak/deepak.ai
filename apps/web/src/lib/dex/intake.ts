import "server-only";
import { getDb } from "@/db/index";
import { dexVisitorIntake } from "@/db/schema";
import { isDexVisitorRole, type DexIntakePayload } from "./intake-shared";

const MAX_FIELD_LENGTH = 200;
const MAX_REASON_LENGTH = 500;

export function parseDexIntakePayload(body: unknown): DexIntakePayload | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;

  if (!isDexVisitorRole(raw.role)) return null;

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name || name.length > MAX_FIELD_LENGTH) return null;

  const company =
    typeof raw.company === "string" ? raw.company.trim().slice(0, MAX_FIELD_LENGTH) : "";
  const contact =
    typeof raw.contact === "string" ? raw.contact.trim().slice(0, MAX_FIELD_LENGTH) : "";
  const reason =
    typeof raw.reason === "string" ? raw.reason.trim().slice(0, MAX_REASON_LENGTH) : "";

  return { role: raw.role, name, company, contact, reason };
}

export async function saveDexVisitorIntake(payload: DexIntakePayload): Promise<void> {
  const db = getDb();
  await db.insert(dexVisitorIntake).values(payload);
}
