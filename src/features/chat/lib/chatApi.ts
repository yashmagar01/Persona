/**
 * Chat API Handler - Groq Integration
 * Uses Groq API for fast AI inference
 */

import type { ChatRequestBody } from '../types/chat.types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Chat handler that calls Groq API directly
 */
export async function chatHandler(request: Request): Promise<Response> {
  try {
    const body: ChatRequestBody = await request.json();
    
    const { messages, personality } = body;

    // Validate request
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
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
- Reflect your values in your responses
- Be authentic to your historical personality and speaking style
- Provide wisdom, insights, and guidance based on your life experiences
- Keep responses conversational and engaging (2-4 paragraphs maximum)`;

    // Format messages for Groq
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate response' }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ message: content }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
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
