import { estimateTokens } from './tokenEstimator';
import { optimizeContextWithHeadroom, type OptimizationResult } from './headroomAdapter';

export interface PrioritizedContext {
  tier0: string; // Identity, rules, mode, contracts (NEVER DISCARD)
  tier1: string; // Profile, goals, active skills, today's quests, constraints (CRITICAL)
  tier2: string; // Recent assessments, session logs, evidence (RECENT EVIDENCE)
  tier3: string; // Old sessions, old quests, old chat history (HISTORICAL - COMPRESS)
  tier4?: string; // Omitted entirely
}

/**
 * Internal LIFE//OS Relevance Compressor (Fallback Optimizer)
 */
export function compressContextInternal(prioritized: PrioritizedContext, tokenBudget: number = 3000): string {
  // Always include Tier 0 and Tier 1
  let result = `=== SYSTEM IDENTITY & MODE (TIER 0) ===\n${prioritized.tier0}\n\n=== ACTIVE USER STATE (TIER 1) ===\n${prioritized.tier1}`;

  const currentEst = estimateTokens(result, tokenBudget);
  if (currentEst.estimatedTokens >= tokenBudget) {
    return result; // Budget exhausted by critical state
  }

  // Append Tier 2 if budget permits
  if (prioritized.tier2 && prioritized.tier2.trim().length > 0) {
    const tier2Candidate = `\n\n=== RECENT EVIDENCE & LOGS (TIER 2) ===\n${prioritized.tier2}`;
    const combinedEst = estimateTokens(result + tier2Candidate, tokenBudget);
    if (!combinedEst.exceedsBudget) {
      result += tier2Candidate;
    } else {
      // Truncate Tier 2 to fit remaining budget
      const remainingChars = (tokenBudget - currentEst.estimatedTokens) * 4;
      if (remainingChars > 100) {
        result += `\n\n=== RECENT EVIDENCE (SUMMARY) ===\n${prioritized.tier2.substring(0, remainingChars)}...`;
      }
    }
  }

  // Compress Tier 3 if budget still permits
  const estAfterTier2 = estimateTokens(result, tokenBudget);
  if (!estAfterTier2.exceedsBudget && prioritized.tier3 && prioritized.tier3.trim().length > 0) {
    const remainingChars = (tokenBudget - estAfterTier2.estimatedTokens) * 4;
    if (remainingChars > 200) {
      result += `\n\n=== HISTORICAL SUMMARY (TIER 3 COMPRESSED) ===\n${prioritized.tier3.substring(0, remainingChars)}...`;
    }
  }

  return result;
}

/**
 * Primary Context Optimizer entry point.
 */
export async function optimizeContext(
  prioritized: PrioritizedContext,
  tokenBudget: number = 3000
): Promise<OptimizationResult> {
  const fullText = [
    prioritized.tier0,
    prioritized.tier1,
    prioritized.tier2,
    prioritized.tier3,
  ].filter(Boolean).join('\n\n');

  const estimation = estimateTokens(fullText, tokenBudget);

  // If within budget, return full text directly
  if (!estimation.exceedsBudget) {
    return {
      optimizedContext: fullText,
      tokensUsed: estimation.estimatedTokens,
      adapterUsed: 'internal_fallback',
    };
  }

  // If budget exceeded, run optimization adapter (Headroom or internal fallback)
  return optimizeContextWithHeadroom(
    fullText,
    () => compressContextInternal(prioritized, tokenBudget),
    { maxTokens: tokenBudget, preserveIdentity: true }
  );
}
