// Trial rules: org required, plan picked at signup, 7-day / 40-minute trial
// (card-required at go-live; no dedicated DID on free trial — see GO_LIVE_PRICING.md).

export const TRIAL_DAYS = 7;
export const TRIAL_MINUTES = 40;

export const TRIAL_PLANS = ["essential", "pro", "business"] as const;
export type TrialPlan = (typeof TRIAL_PLANS)[number];

export function isTrialPlan(v: string): v is TrialPlan {
  return (TRIAL_PLANS as readonly string[]).includes(v);
}

// Seats per plan (Clerk org cap of 5 stays as the coarse guard).
export const SEATS_PER_PLAN: Record<TrialPlan, number> = {
  essential: 1,
  pro: 3,
  business: 5,
};

export function seatsForPlan(plan: string): number {
  return isTrialPlan(plan) ? SEATS_PER_PLAN[plan] : 1;
}

export function trialEndsAt(startedAt: Date): Date {
  return new Date(startedAt.getTime() + TRIAL_DAYS * 86_400_000);
}

export function trialActive(startedAt: Date | null, now = new Date()): boolean {
  if (!startedAt) return false;
  return now < trialEndsAt(startedAt);
}
