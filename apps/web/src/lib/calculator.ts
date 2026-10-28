// Lost-call calculator (borrowed idea with disclaimer — never a promise).
// Pure math, HUF integers.

export interface CalcInput {
  avgJobHuf: number; // average revenue per job
  missedPerWeek: number; // missed calls per week
  payingSharePct: number; // % that would become paying work
}

export interface CalcResult {
  jobsPerMonth: number;
  extraRevenueHuf: number;
  planHuf: number; // reference plan for payback comparison
  jobsToCoverPlan: number;
}

export function calculate(input: CalcInput, planHuf = 34900): CalcResult {
  const jobs = (input.missedPerWeek * 4.3 * input.payingSharePct) / 100;
  const revenue = Math.round(jobs * input.avgJobHuf);
  return {
    jobsPerMonth: Math.round(jobs * 10) / 10,
    extraRevenueHuf: revenue,
    planHuf,
    jobsToCoverPlan: Math.ceil(planHuf / Math.max(1, input.avgJobHuf)),
  };
}

export function formatHuf(n: number): string {
  return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft`;
}
