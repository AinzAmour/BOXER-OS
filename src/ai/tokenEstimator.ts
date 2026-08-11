/**
 * Lightweight token estimation for LIFE//OS context budget calculation.
 * Heuristic: estimated_tokens ≈ characters / 4.
 */

export interface TokenEstimation {
  estimatedTokens: number;
  characterCount: number;
  exceedsBudget: boolean;
  budget: number;
}

export const DEFAULT_CONTEXT_TOKEN_BUDGET = 3000; // ~12,000 chars

export function estimateTokens(
  text: string,
  budget: number = DEFAULT_CONTEXT_TOKEN_BUDGET
): TokenEstimation {
  const characterCount = text ? text.length : 0;
  const estimatedTokens = Math.ceil(characterCount / 4);
  return {
    estimatedTokens,
    characterCount,
    exceedsBudget: estimatedTokens > budget,
    budget,
  };
}

export function estimateObjectTokens(
  obj: unknown,
  budget: number = DEFAULT_CONTEXT_TOKEN_BUDGET
): TokenEstimation {
  const jsonStr = JSON.stringify(obj || {});
  return estimateTokens(jsonStr, budget);
}
