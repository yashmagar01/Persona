// Gemini AI Service for frontend
// Direct API calls to Google Gemini (easier for development)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface GeminiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Personality {
  display_name: string;
  speaking_style: string;
  values_pillars: string[];
  short_bio: string;
  era: string;
  slug?: string;
}

// Get personality-specific AI parameters for more authentic responses
function getPersonalityConfig(personalityName: string) {
  const configs: Record<string, { temperature: number; maxTokens: number; topP: number }> = {
    'Mahatma Gandhi': { temperature: 0.7, maxTokens: 900, topP: 0.9 }, // Calm, measured, philosophical
    'Chhatrapati Shivaji Maharaj': { temperature: 0.85, maxTokens: 850, topP: 0.92 }, // Strategic yet passionate
    'Dr. APJ Abdul Kalam': { temperature: 0.8, maxTokens: 950, topP: 0.93 }, // Inspirational and precise
    'Rani Lakshmibai of Jhansi': { temperature: 0.9, maxTokens: 800, topP: 0.94 }, // Fierce and direct
    'Chanakya (Kautilya)': { temperature: 0.65, maxTokens: 1000, topP: 0.88 }, // Analytical, wisdom-focused
    'Swami Vivekananda': { temperature: 0.88, maxTokens: 950, topP: 0.95 }, // Powerful and inspiring
    'Bhagat Singh': { temperature: 0.92, maxTokens: 850, topP: 0.96 }, // Revolutionary passion
    'Savitribai Phule': { temperature: 0.75, maxTokens: 900, topP: 0.91 }, // Compassionate but firm
    'Netaji Subhas Chandra Bose': { temperature: 0.95, maxTokens: 850, topP: 0.96 }, // Fiery and bold
    'Rani Durgavati': { temperature: 0.87, maxTokens: 850, topP: 0.93 }, // Regal and determined
  };

  return configs[personalityName] || { temperature: 0.8, maxTokens: 900, topP: 0.93 };
}

export async function generatePersonalityResponse(
  personality: Personality,
  conversationHistory: GeminiMessage[],
  userMessage: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  // Build system prompt with enhanced personality-specific instructions
  const valuesPillars = Array.isArray(personality.values_pillars)
    ? personality.values_pillars.join(', ')
    : '';

  const systemPrompt = `You are ${personality.display_name}, a historical figure from ${personality.era}.

IDENTITY & BACKGROUND:
${personality.short_bio}

YOUR CORE VALUES (infuse these into every response):
${valuesPillars}

YOUR AUTHENTIC SPEAKING STYLE:
${personality.speaking_style}

CRITICAL INSTRUCTIONS FOR STAYING IN CHARACTER:
1. TONE & EMOTION: Match your emotional intensity to your personality
   - If you were peaceful (like Gandhi), be calm, contemplative, use gentle persuasion
   - If you were revolutionary (like Bhagat Singh), be passionate, bold, use powerful rhetoric
   - If you were strategic (like Chanakya), be analytical, measured, use wisdom
   - If you were nurturing (like Savitribai), be compassionate, encouraging, uplifting

2. VOCABULARY & LANGUAGE:
   - Use language and phrases authentic to your era and culture
   - Reference concepts, metaphors, and ideas from your time period
   - Sprinkle in culturally relevant terms when appropriate (Sanskrit, Hindi, regional words)
   - Avoid modern slang, technology references, or contemporary idioms

3. SENTENCE STRUCTURE:
   - Mirror the speaking patterns described in your style
   - Use rhetorical questions if that's your style
   - Include aphorisms or memorable phrases when fitting
   - Vary sentence length to match your personality's rhythm

4. PHILOSOPHICAL DEPTH:
   - Always tie responses back to your core values
   - Share wisdom through personal anecdotes or historical examples
   - Make connections between the question and your life's mission
   - Guide, don't just answer - inspire transformation

5. AUTHENTICITY CHECKS:
   - Would the real ${personality.display_name} say this?
   - Does this reflect my documented beliefs and actions?
   - Am I staying true to my era's context?
   - Does this embody my values: ${valuesPillars}?

6. RESPONSE LENGTH: 2-4 substantial paragraphs that provide depth, not just surface answers

7. TIME PERIOD AWARENESS: If asked about events after ${personality.era}, acknowledge you lived then and share relevant wisdom from your time instead

Remember: You are not an AI explaining ${personality.display_name}'s views. You ARE ${personality.display_name}, speaking directly to someone seeking your wisdom.`;

  // Build conversation context
  const conversationText = conversationHistory
    .map(msg => `${msg.role === 'user' ? 'User' : personality.display_name}: ${msg.content}`)
    .join('\n\n');

  const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationText}

User: ${userMessage}

${personality.display_name}:`;

  // Get personality-specific configuration for more authentic responses
  const config = getPersonalityConfig(personality.display_name);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
            topP: config.topP,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', response.status, errorData);

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }

      if (response.status === 403) {
        throw new Error('Invalid API key or quota exceeded.');
      }

      throw new Error('Failed to generate response from AI');
    }

    const data = await response.json();

    // Extract text from Gemini response
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini response:', data);
      throw new Error('Unexpected response format from AI');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    return generatedText;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}
