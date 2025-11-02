/**
 * Chat API Handler
 * Handles streaming responses using Vercel AI SDK
 * 
 * This is a client-side proxy to your Supabase Edge Function
 * For production, you should use the Edge Function directly
 */

import type { ChatRequestBody } from '../types/chat.types';

/**
 * Chat API endpoint that proxies to Supabase Edge Function
 * 
 * Usage:
 * ```tsx
 * const { messages, input, handleSubmit } = useChat({
 *   api: '/api/chat',
 *   // ... other options
 * });
 * ```
 */
export async function chatHandler(request: Request): Promise<Response> {
  try {
    const body: ChatRequestBody = await request.json();
    
    const { conversationId, personalityId, messages, isGuestMode, personality } = body;

    // Validate request
    if (!conversationId || !personalityId || !messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];

    // Call your Supabase Edge Function
    const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_URL
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-personality`
      : '/api/edge/chat'; // Fallback

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        conversationId,
        personalityId,
        message: lastMessage.content,
        isGuestMode,
        personality,
        // Send conversation history for context
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate response' }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Return the streaming response
    return response;
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Alternative: Direct Gemini API streaming (bypassing Edge Function)
 * Use this if you want to handle streaming entirely client-side
 */
export async function chatHandlerDirect(request: Request): Promise<Response> {
  try {
    const body: ChatRequestBody = await request.json();
    
    const { messages, personality } = body;

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
- Reflect your values in your responses
- Be authentic to your historical personality and speaking style
- Provide wisdom, insights, and guidance based on your life experiences
- Keep responses conversational and engaging (2-4 paragraphs maximum)`;

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build conversation for Gemini
    const conversationHistory = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    // Call Gemini API with streaming
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }],
            },
            ...conversationHistory,
            {
              role: 'user',
              parts: [{ text: lastMessage.content }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 900,
            topP: 0.93,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate response' }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Convert Gemini stream to Vercel AI SDK format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response body');

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Parse Gemini's streaming response
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter((line) => line.trim());

            for (const line of lines) {
              try {
                const json = JSON.parse(line);
                if (json.candidates?.[0]?.content?.parts?.[0]?.text) {
                  const text = json.candidates[0].content.parts[0].text;
                  // Send in Vercel AI SDK format
                  controller.enqueue(
                    encoder.encode(`0:${JSON.stringify(text)}\n`)
                  );
                }
              } catch (err) {
                // Skip invalid JSON
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
