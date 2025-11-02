// services/chatService.ts
// Public service facade for chat operations and streaming

import { supabase } from '@/integrations/supabase/client';
import { toast, commonToasts } from '@/lib/toast.utils';
import { logApiError, logError } from '@/lib/errorLogger';
import type { Conversation, ConversationWithPersonality, Message, SendMessageInput, SendResult } from '../types/chat.types';
import { getGuestConversation, updateGuestConversation, createGuestConversation } from '../lib/chatService';

/**
 * API Error class with status code
 */
export class ApiError extends Error {
	constructor(
		message: string,
		public statusCode: number,
		public apiMessage?: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

/**
 * Handle API errors with specific status codes
 */
function handleApiError(statusCode: number, responseBody?: any): never {
	const customMessage = responseBody?.error || responseBody?.message;
	
	switch (statusCode) {
		case 401:
			logApiError('Unauthorized request', statusCode);
			commonToasts.unauthorized();
			// Redirect to login page
			window.location.href = '/auth';
			throw new ApiError('Unauthorized', 401, customMessage);
		
		case 403:
			logApiError('Forbidden request', statusCode);
			commonToasts.forbidden();
			throw new ApiError('Access denied', 403, customMessage);
		
		case 429:
			logApiError('Rate limit exceeded', statusCode);
			commonToasts.rateLimited();
			throw new ApiError('Too many requests', 429, customMessage);
		
		case 500:
		case 502:
		case 503:
			logApiError('Server error', statusCode);
			commonToasts.serverError();
			throw new ApiError('Server error', statusCode, customMessage);
		
		default:
			const message = customMessage || `Request failed with status ${statusCode}`;
			logApiError(message, statusCode);
			toast.error(message);
			throw new ApiError(message, statusCode, customMessage);
	}
}

// =====================================
// Conversation APIs
// =====================================

export async function createConversation(personalityId: string, title?: string): Promise<ConversationWithPersonality | { id: string }> {
	// Try authenticated path first
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) {
		// guest conversation
		const guest = createGuestConversation(personalityId, 'College Sahayak');
		return { id: guest.id };
	}

	const { data, error } = await supabase
		.from('conversations')
		.insert([{ user_id: user.id, personality_id: personalityId, title: title || 'New Conversation' }])
		.select(`
			*,
			personalities (
				id, slug, display_name, era, short_bio, speaking_style, values_pillars, avatar_url
			)
		`)
		.single();
	if (error) throw error;
	return data as ConversationWithPersonality;
}

export async function getConversation(id: string): Promise<ConversationWithPersonality | null> {
	if (id.startsWith('guest-')) {
		const conv = getGuestConversation(id);
		if (!conv) return null;
		// Map to minimal Conversation shape
		return {
			id: conv.id,
			user_id: 'guest',
			personality_id: conv.personality_id,
			title: conv.title,
			created_at: conv.created_at,
			updated_at: conv.created_at,
			personalities: {
				id: conv.personality_id,
				slug: 'guest',
				display_name: conv.display_name,
				era: '',
				short_bio: '',
				speaking_style: '',
				values_pillars: [],
				avatar_url: null,
			},
		} as unknown as ConversationWithPersonality;
	}

	const { data, error } = await supabase
		.from('conversations')
		.select(`
			*,
			personalities (
				id, slug, display_name, era, short_bio, speaking_style, values_pillars, avatar_url
			)
		`)
		.eq('id', id)
		.single();
	if (error) throw error;
	return data as ConversationWithPersonality;
}

export async function getConversations(): Promise<ConversationWithPersonality[]> {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];

	const { data, error } = await supabase
		.from('conversations')
		.select(`
			*,
			personalities (
				id, slug, display_name, era, short_bio, speaking_style, values_pillars, avatar_url
			)
		`)
		.eq('user_id', user.id)
		.order('updated_at', { ascending: false });
	if (error) throw error;
	return (data || []) as ConversationWithPersonality[];
}

export async function deleteConversation(id: string): Promise<void> {
	if (id.startsWith('guest-')) {
		localStorage.removeItem(`guest-conversation-${id}`);
		return;
	}
	const { error } = await supabase.from('conversations').delete().eq('id', id);
	if (error) throw error;
}

export async function renameConversation(id: string, newTitle: string): Promise<void> {
	if (id.startsWith('guest-')) {
		const conv = getGuestConversation(id);
		if (conv) {
			const updated = { ...conv, title: newTitle };
			localStorage.setItem(`guest-conversation-${id}`, JSON.stringify(updated));
		}
		return;
	}
	const { error } = await supabase.from('conversations').update({ title: newTitle }).eq('id', id);
	if (error) throw error;
}

// =====================================
// Messaging / Streaming
// =====================================

export async function sendMessage(
	input: Omit<SendMessageInput, 'role'> & { personalityId?: string; persona?: any; onToken?: (t: string) => void }
): Promise<{ abortController: AbortController; done: Promise<SendResult> }> {
	const controller = new AbortController();

	const body = {
		conversationId: input.conversationId,
		messages: [], // server can reconstruct from DB; client hook handles optimistic user save
		personalityId: input.personalityId,
		personality: input.persona,
	} as any;

	let resp: Response;
	
	try {
		resp = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
			signal: controller.signal,
		});
	} catch (err: any) {
		// Network error
		if (err?.name === 'AbortError') {
			throw err;
		}
		
		logError('Network error in sendMessage', err, {
			component: 'chatService',
			action: 'sendMessage',
			conversationId: input.conversationId,
		});
		
		if (!window.navigator.onLine) {
			commonToasts.offline();
		} else {
			toast.error('Network error. Please check your connection.');
		}
		
		throw err;
	}

	// Handle non-OK responses
	if (!resp.ok) {
		let errorBody: any;
		try {
			errorBody = await resp.json();
		} catch {
			errorBody = null;
		}
		handleApiError(resp.status, errorBody);
	}

	// Handle missing body
	if (!resp.body) {
		const msg = 'No response body received';
		logError(msg, undefined, { conversationId: input.conversationId });
		toast.error(msg);
		throw new Error(msg);
	}

	const reader = resp.body.getReader();
	const decoder = new TextDecoder('utf-8');
	let content = '';

	const done = (async () => {
		try {
			// Stream chunks
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				const chunk = decoder.decode(value, { stream: true });
				content += chunk;
				input.onToken?.(chunk);
			}
			return { messageId: `msg-${Date.now()}`, content } as SendResult;
		} catch (err: any) {
			if (err?.name === 'AbortError') {
				logError('Message generation aborted', err, { conversationId: input.conversationId });
				return { messageId: 'aborted', content } as SendResult;
			}
			
			logError('Streaming error', err, { 
				component: 'chatService',
				action: 'streamingMessage',
				conversationId: input.conversationId 
			});
			
			toast.error(err?.message || 'Error during message generation');
			throw err;
		}
	})();

	return { abortController: controller, done };
}

export async function retryMessage(conversationId: string, messageId: string): Promise<void> {
	// Minimal placeholder: real implementation would reload last user prompt and re-stream
	console.debug('Retry requested', { conversationId, messageId });
}

export * from '../lib/chatService';
