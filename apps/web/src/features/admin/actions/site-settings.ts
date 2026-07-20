"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { siteSettings, siteSettingsVersions } from "@/db/schema";

export interface SettingsFormState {
  error: string | null;
  saved?: boolean;
}

export async function saveSiteSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const db = getDb();

  const keys = [
    "identitySentence",
    "identitySupport",
    "currentFocus",
    "currentFocusUpdatedAt",
    "mission",
    "contactSentence",
    "contactEmail",
    "cvUrl",
  ] as const;

  const outboundKeys = ["github", "linkedin", "x", "instagram", "scholar"] as const;

  for (const key of keys) {
    const value = (formData.get(key) as string)?.trim() ?? "";

    // Snapshot previous value for version history
    const [prev] = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, key)).limit(1);

    await db.insert(siteSettings).values({ key, value }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    });

    const prevValue = prev?.value ?? null;
    if (JSON.stringify(prevValue) !== JSON.stringify(value)) {
      await db.insert(siteSettingsVersions).values({
        key,
        snapshot: { previous: prevValue, current: value },
        origin: "manual_save",
      });
    }
  }

  // Outbound links as a single JSON key
  const outbound: Record<string, string> = {};
  for (const k of outboundKeys) {
    outbound[k] = (formData.get(`outbound.${k}`) as string)?.trim() ?? "";
  }
  const prevOutbound = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "outbound")).limit(1);
  await db.insert(siteSettings).values({ key: "outbound", value: outbound }).onConflictDoUpdate({
    target: siteSettings.key,
    set: { value: outbound, updatedAt: new Date() },
  });
  if (JSON.stringify(prevOutbound[0]?.value) !== JSON.stringify(outbound)) {
    await db.insert(siteSettingsVersions).values({
      key: "outbound",
      snapshot: { previous: prevOutbound[0]?.value ?? null, current: outbound },
      origin: "manual_save",
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { error: null, saved: true };
}
