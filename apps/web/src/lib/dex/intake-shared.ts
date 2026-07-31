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
