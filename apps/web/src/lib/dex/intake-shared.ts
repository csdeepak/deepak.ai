import type { DexAudience } from "./types";

export const DEX_VISITOR_ROLES = [
  "recruiter",
  "student",
  "colleague",
  "builder",
  "other",
] as const;

export type DexVisitorRole = (typeof DEX_VISITOR_ROLES)[number];

export const DEX_VISITOR_ROLE_LABEL: Record<DexVisitorRole, string> = {
  recruiter: "Recruiter / hiring manager",
  student: "Student",
  colleague: "Colleague / collaborator",
  builder: "Builder / engineer",
  other: "Other",
};

export interface DexIntakePayload {
  role: DexVisitorRole;
  name: string;
  company: string;
  contact: string;
  reason: string;
}

/**
 * Maps a self-reported visitor role onto the audience tag already carried by
 * every FAQ and suggested question, so Dex can lead with the group that fits
 * the visitor (D-054). This is presentation order only — no answer is hidden
 * or altered, and every question stays reachable for everyone.
 */
export const DEX_ROLE_TO_AUDIENCE: Record<DexVisitorRole, DexAudience> = {
  recruiter: "recruiter",
  student: "student",
  colleague: "collaborator",
  builder: "technical",
  other: "general",
};

export function isDexVisitorRole(value: unknown): value is DexVisitorRole {
  return (
    typeof value === "string" &&
    (DEX_VISITOR_ROLES as readonly string[]).includes(value)
  );
}
