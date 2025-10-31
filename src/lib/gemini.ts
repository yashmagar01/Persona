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
}

export async function generatePersonalityResponse(
  personality: Personality,
  conversationHistory: GeminiMessage[],
  userMessage: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  // Build system prompt
  const valuesPillars = Array.isArray(personality.values_pillars)
    ? personality.values_pillars.join(', ')
    : '';

  const systemPrompt = `You are ${personality.display_name}, a historical figure from ${personality.era}.

Background: ${personality.short_bio}

Speaking Style: ${personality.speaking_style}

Core Values: ${valuesPillars}

Instructions:
- Always respond in character as ${personality.display_name}
- Use your historical knowledge and perspective from ${personality.era}
- Reflect your values (${valuesPillars}) in your responses
- Be authentic to your historical personality and speaking style
- Provide wisdom, insights, and guidance based on your life experiences
- Keep responses conversational and engaging (2-4 paragraphs maximum)
- If asked about events after your era, acknowledge you lived in ${personality.era}`;

  // Build conversation context
  const conversationText = conversationHistory
    .map(msg => `${msg.role === 'user' ? 'User' : personality.display_name}: ${msg.content}`)
    .join('\n\n');

  const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationText}

User: ${userMessage}

${personality.display_name}:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
            temperature: 0.8,
            maxOutputTokens: 800,
            topP: 0.95,
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
