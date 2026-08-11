/**
 * Debt Payoff Planner (Snowball vs Avalanche)
 *
 * Simulates two popular debt-elimination strategies and compares them:
 *  - Snowball: pay off the smallest balance first (psychological wins).
 *  - Avalanche: pay off the highest interest rate first (least total interest).
 *
 * Input debts as one line per debt: Name, Balance, Annual Rate %, Minimum Payment.
 */

import type { CalculationResult } from "@/types";

export interface Debt {
  name: string;
  balance: number;
  rate: number; // annual percentage, e.g. 19.9 for 19.9%
  min: number;
}

export interface DebtInput {
  debtsText: string;
  extra: number;
}

export interface StrategyResult {
  order: string[];
  months: number;
  totalInterest: number;
  totalPaid: number;
}

export interface DebtCalculatorResult {
  snowball: StrategyResult;
  avalanche: StrategyResult;
  principal: number;
}

/** Parse the debts text area into a validated list of debts. */
export function parseDebts(raw: string): Debt[] {
  const debts: Debt[] = [];
  const lines = raw.split(/\n/);
  for (const line of lines) {
    const parts = line.split(/[,;\t]/).map((p) => p.trim());
    if (parts.length < 4) continue;
    const name = parts[0];
    const balance = Number(parts[1]);
    const rate = Number(parts[2]);
    const min = Number(parts[3]);
    if (!name || !Number.isFinite(balance) || !Number.isFinite(rate) || !Number.isFinite(min)) {
      continue;
    }
    if (balance <= 0) continue;
    debts.push({ name, balance, rate: rate / 100, min: Math.max(min, 0) });
  }
  return debts;
}

/**
 * Simulate a debt payoff given a priority order of debt indices.
 *
 * @param debts - validated debt list
 * @param order - indices in payoff priority
 * @param extra - extra monthly payment applied to the current target
 * @returns months to payoff, total interest, total paid, payoff order (names)
 */
function simulate(debts: Debt[], order: number[], extra: number): StrategyResult {
  const balances = debts.map((d) => d.balance);
  const paidOffMonth: number[] = new Array(debts.length).fill(-1);
  let totalInterest = 0;
  let totalPaid = 0;
  let months = 0;
  const MAX_MONTHS = 1200;

  while (balances.some((b) => b > 0.005) && months < MAX_MONTHS) {
    months += 1;
    // Accrue monthly interest
    for (let i = 0; i < debts.length; i++) {
      if (balances[i] > 0) {
        const interest = balances[i] * (debts[i].rate / 12);
        balances[i] += interest;
        totalInterest += interest;
      }
    }
    let available = extra;
    for (let i = 0; i < debts.length; i++) {
      if (balances[i] > 0) available += debts[i].min;
    }
    // Pay minimums
    for (let i = 0; i < debts.length; i++) {
      if (balances[i] > 0) {
        const pay = Math.min(debts[i].min, balances[i]);
        balances[i] -= pay;
        totalPaid += pay;
        available -= pay;
      }
    }
    // Apply remaining to the first unpaid debt in priority order
    for (const idx of order) {
      if (available <= 0) break;
      if (balances[idx] > 0) {
        const pay = Math.min(available, balances[idx]);
        balances[idx] -= pay;
        totalPaid += pay;
        available -= pay;
        if (balances[idx] <= 0.005 && paidOffMonth[idx] === -1) {
          paidOffMonth[idx] = months;
        }
      }
    }
    // Catch any debts that hit zero without the extra allocation above
    for (let i = 0; i < debts.length; i++) {
      if (balances[i] <= 0.005 && paidOffMonth[i] === -1) {
        paidOffMonth[i] = months;
        balances[i] = 0;
      }
    }
  }

  const payoffOrder = paidOffMonth
    .map((m, i) => ({ m, name: debts[i].name }))
    .filter((x) => x.m !== -1)
    .sort((x, y) => x.m - y.m)
    .map((x) => x.name);

  return { order: payoffOrder, months, totalInterest, totalPaid };
}

export function calculateDebtPlanner(input: DebtInput): CalculationResult<DebtCalculatorResult> {
  const { debtsText, extra } = input;
  const debts = parseDebts(debtsText);
  if (debts.length === 0) {
    return {
      ok: false,
      error: "Add at least one debt (Name, Balance, Rate %, Min Payment)",
      code: "INVALID_INPUT",
    };
  }
  if (!Number.isFinite(extra) || extra < 0) {
    return { ok: false, error: "Extra payment must be a positive number", code: "INVALID_INPUT" };
  }

  const principal = debts.reduce((s, d) => s + d.balance, 0);
  const indices = debts.map((_, i) => i);
  const snowballOrder = [...indices].sort((a, b) => debts[a].balance - debts[b].balance);
  const avalancheOrder = [...indices].sort((a, b) => debts[b].rate - debts[a].rate);

  const snowball = simulate(debts, snowballOrder, extra);
  const avalanche = simulate(debts, avalancheOrder, extra);

  return { ok: true, value: { snowball, avalanche, principal } };
}
