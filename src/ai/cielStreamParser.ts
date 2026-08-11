import { parseCielResponseEnvelope, type ParsedCielEnvelopeResult } from './cielResponseParser';

export interface StreamPresentationState {
  accumulatedText: string;
  isComplete: boolean;
  finalParsed: ParsedCielEnvelopeResult | null;
}

/**
 * Stream Presentation Parser Wrapper.
 *
 * CRITICAL SECURITY INSTRUCTION:
 * Partial streamed data MUST NEVER reach the Action Engine or mutate Dexie.
 * Streaming is exclusively for UI text display. Only the completed, validated envelope
 * will be submitted to the Action Engine.
 */
export class CielStreamPresentationParser {
  private buffer: string = '';

  public appendChunk(chunk: string): string {
    this.buffer += chunk;

    // Strip markdown code block markers during live text rendering
    const cleanStreamText = this.buffer
      .replace(/```(?:json)?[\s\S]*$/i, '')
      .replace(/```/g, '')
      .trim();

    return cleanStreamText || this.buffer;
  }

  public finalize(): ParsedCielEnvelopeResult {
    return parseCielResponseEnvelope(this.buffer);
  }

  public reset(): void {
    this.buffer = '';
  }
}
