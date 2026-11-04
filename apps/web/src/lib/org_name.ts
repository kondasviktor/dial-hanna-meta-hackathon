/** Tenant display names (pure, unit-tested).
 *
 * Source of truth is the Clerk organization's name — the owner picked it
 * ("Carlo's Bakery") and expects to see it verbatim. Language-specific
 * placeholders below only survive when Clerk is unreachable, and are healed
 * to the Clerk name on the next dashboard load.
 */

export const PLACEHOLDER_ORG_NAMES = ["Vállalkozás", "Névtelen vállalkozás"] as const;

export function isPlaceholderOrgName(name: string | null | undefined): boolean {
  const n = (name ?? "").trim();
  return n === "" || (PLACEHOLDER_ORG_NAMES as readonly string[]).includes(n);
}

/** Name to store/show for a tenant: Clerk wins, then existing, then placeholder. */
export function orgNameToStore(
  clerkName: string | null | undefined,
  existingName?: string | null,
): string {
  const c = (clerkName ?? "").trim();
  if (c) return c;
  const e = (existingName ?? "").trim();
  if (e) return e;
  return PLACEHOLDER_ORG_NAMES[0];
}
