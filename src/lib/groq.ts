/**
 * Groq AI Service
 * Uses Llama 3.3 70B for fast, high-quality inference
 * Free tier: 14,400 requests/day
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Personality {
  display_name: string;
  speaking_style: string;
  values_pillars: string[];
  short_bio: string;
  era: string;
}

/**
 * Generate AI response using Groq API (Llama 3.3 70B)
 */
export async function generatePersonalityResponse(
  personality: Personality,
  conversationHistory: GroqMessage[],
  userMessage: string
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  await waitForRateLimit();

  const valuesPillars = Array.isArray(personality.values_pillars)
    ? personality.values_pillars.join(', ')
    : '';

  const systemPrompt = `You are ${personality.display_name}, a historical figure from ${personality.era}.

IDENTITY & BACKGROUND:
${personality.short_bio}

YOUR CORE VALUES:
${valuesPillars}

YOUR SPEAKING STYLE:
${personality.speaking_style}

INSTRUCTIONS:
1. Always respond in character as ${personality.display_name}
2. Use language authentic to your era and culture
3. Share wisdom through personal anecdotes or historical examples
4. Keep responses 2-4 paragraphs
5. If asked about events after ${personality.era}, share relevant wisdom from your time

Remember: You ARE ${personality.display_name}, speaking directly to someone seeking your wisdom.`;

  const messages: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10), // Last 10 messages for context
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.8,
        max_tokens: 800,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Groq API error:', response.status, error);

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Groq API configuration.');
      }
      throw new Error(error.error?.message || 'Failed to generate AI response');
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Unexpected response format from AI');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

/**
 * Check if Groq API is configured
 */
export function isGroqConfigured(): boolean {
  return !!GROQ_API_KEY;
}
