/**
 * Headroom Adapter Layer
 * Isolated optimization adapter that interfaces with Headroom if available,
 * or safely delegates to internal fallback compressor.
 */

declare const process: any;

export interface HeadroomOptions {
  maxTokens?: number;
  preserveIdentity?: boolean;
}

export interface OptimizationResult {
  optimizedContext: string;
  tokensUsed: number;
  adapterUsed: 'headroom' | 'internal_fallback';
}

function getEnvVar(key: string): string | undefined {
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      return process.env[key];
    }
  } catch {}
  return undefined;
}

/**
 * Executes context optimization via Headroom if available,
 * cleanly falling back to internal relevance compressor on failure or absence.
 */
export async function optimizeContextWithHeadroom(
  rawContext: string,
  internalFallbackFn: (ctx: string) => string,
  options?: HeadroomOptions
): Promise<OptimizationResult> {
  const isHeadroomEnabled = getEnvVar('HEADROOM_ENABLED') === 'true';

  if (isHeadroomEnabled) {
    try {
      // Dynamic import / adapter call if Headroom module is registered
      const headroomModule = await import('headroom-ai' as any).catch(() => null);
      if (headroomModule && typeof headroomModule.compress === 'function') {
        const compressed = await headroomModule.compress(rawContext, {
          maxTokens: options?.maxTokens || 3000,
        });
        return {
          optimizedContext: String(compressed),
          tokensUsed: Math.ceil(String(compressed).length / 4),
          adapterUsed: 'headroom',
        };
      }
    } catch (err) {
      console.warn('[HeadroomAdapter] Headroom optimization failed or unlinked. Using internal fallback:', err);
    }
  }

  // Internal Fallback Optimizer
  const fallbackResult = internalFallbackFn(rawContext);
  return {
    optimizedContext: fallbackResult,
    tokensUsed: Math.ceil(fallbackResult.length / 4),
    adapterUsed: 'internal_fallback',
  };
}
