/**
 * Provider Router Module
 * Routes LLM completion calls to configured primary/fallback providers.
 * Reads model IDs strictly from environment configuration (GROQ_MODEL, GEMINI_MODEL)
 * so model choices can be updated dynamically without altering core application architecture.
 */

declare const process: any;

export interface ProviderResponse {
  rawResponse: string;
  providerUsed: 'groq' | 'gemini' | 'local_ciel';
}

export interface ProviderCallParams {
  systemPrompt: string;
  formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  userQuery: string;
}

function getEnvVar(key: string): string | undefined {
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      return process.env[key];
    }
  } catch {}
  return undefined;
}

export async function callProviderRouter(params: ProviderCallParams): Promise<ProviderResponse> {
  const groqApiKey = getEnvVar('GROQ_API_KEY');
  const geminiApiKey = getEnvVar('GEMINI_API_KEY');

  // Environment-driven model choices (no hardcoded model assumptions)
  const groqModel = getEnvVar('GROQ_MODEL') || 'llama-3.3-70b-versatile';
  const geminiModel = getEnvVar('GEMINI_MODEL') || 'gemini-1.5-flash';

  // 1. Primary Provider: Groq API
  if (groqApiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages: params.formattedMessages,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return { rawResponse: reply, providerUsed: 'groq' };
        }
      }
    } catch (err) {
      console.warn('[ProviderRouter] Groq provider failed, falling back to Gemini:', err);
    }
  }

  // 2. Secondary Provider: Gemini API
  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${params.systemPrompt}\n\nUser Query:\n${params.userQuery}` },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return { rawResponse: reply, providerUsed: 'gemini' };
        }
      }
    } catch (err) {
      console.warn('[ProviderRouter] Gemini provider failed:', err);
    }
  }

  // 3. Fallback: Local Ciel Engine
  return {
    rawResponse: '',
    providerUsed: 'local_ciel',
  };
}
