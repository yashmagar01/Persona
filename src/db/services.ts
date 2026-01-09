/**
 * Database Service Layer
 * Provides all database operations using Turso/Drizzle ORM
 * Replaces Supabase client database calls
 */

import { db, schema } from './client';
import { eq, desc, asc, like, or } from 'drizzle-orm';

// Re-export types for convenience
export type { Profile, Personality, Conversation, Message } from './schema';

/**
 * Personality Operations
 */
export async function getAllPersonalities() {
  try {
    const result = await db
      .select()
      .from(schema.personalities)
      .orderBy(asc(schema.personalities.displayName));
    
    // Transform to match expected format
    return result.map(p => ({
      id: p.id,
      slug: p.slug,
      display_name: p.displayName,
      era: p.era,
      short_bio: p.shortBio,
      speaking_style: p.speakingStyle,
      values_pillars: p.valuesPillars || [],
      avatar_url: p.avatarUrl,
      created_at: p.createdAt?.toISOString() || null,
      updated_at: p.updatedAt?.toISOString() || null,
    }));
  } catch (error) {
    console.error('Error fetching personalities:', error);
    return [];
  }
}

export async function getPersonalityById(id: string) {
  try {
    const result = await db
      .select()
      .from(schema.personalities)
      .where(eq(schema.personalities.id, id))
      .limit(1);
    
    if (result.length === 0) return null;
    
    const p = result[0];
    return {
      id: p.id,
      slug: p.slug,
      display_name: p.displayName,
      era: p.era,
      short_bio: p.shortBio,
      speaking_style: p.speakingStyle,
      values_pillars: p.valuesPillars || [],
      avatar_url: p.avatarUrl,
    };
  } catch (error) {
    console.error('Error fetching personality:', error);
    return null;
  }
}

export async function getPersonalityByName(name: string) {
  try {
    const result = await db
      .select()
      .from(schema.personalities)
      .where(like(schema.personalities.displayName, `%${name}%`))
      .limit(1);
    
    if (result.length === 0) return null;
    
    const p = result[0];
    return {
      id: p.id,
      slug: p.slug,
      display_name: p.displayName,
      era: p.era,
      short_bio: p.shortBio,
      speaking_style: p.speakingStyle,
      values_pillars: p.valuesPillars || [],
      avatar_url: p.avatarUrl,
    };
  } catch (error) {
    console.error('Error fetching personality by name:', error);
    return null;
  }
}

/**
 * Conversation Operations
 */
export async function createConversation(userId: string, personalityId: string, title: string) {
  try {
    const id = crypto.randomUUID();
    await db.insert(schema.conversations).values({
      id,
      userId,
      personalityId,
      title,
    });
    
    return { id, userId, personalityId, title };
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
}

export async function getUserConversations(userId: string) {
  try {
    const result = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.userId, userId))
      .orderBy(desc(schema.conversations.updatedAt));
    
    return result.map(c => ({
      id: c.id,
      user_id: c.userId,
      personality_id: c.personalityId,
      title: c.title,
      created_at: c.createdAt?.toISOString() || null,
      updated_at: c.updatedAt?.toISOString() || null,
    }));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export async function getConversationById(id: string) {
  try {
    const result = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.id, id))
      .limit(1);
    
    if (result.length === 0) return null;
    
    const c = result[0];
    return {
      id: c.id,
      user_id: c.userId,
      personality_id: c.personalityId,
      title: c.title,
      created_at: c.createdAt?.toISOString() || null,
      updated_at: c.updatedAt?.toISOString() || null,
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
}

export async function getConversationWithPersonality(conversationId: string) {
  try {
    const conv = await getConversationById(conversationId);
    if (!conv) return null;
    
    const personality = await getPersonalityById(conv.personality_id);
    if (!personality) return null;
    
    return {
      ...conv,
      personalities: personality, // Match Supabase naming
    };
  } catch (error) {
    console.error('Error fetching conversation with personality:', error);
    return null;
  }
}

export async function deleteConversation(id: string) {
  try {
    // Delete messages first (foreign key constraint)
    await db.delete(schema.messages).where(eq(schema.messages.conversationId, id));
    // Delete conversation
    await db.delete(schema.conversations).where(eq(schema.conversations.id, id));
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
}

export async function updateConversationTimestamp(id: string) {
  try {
    await db
      .update(schema.conversations)
      .set({ updatedAt: new Date() })
      .where(eq(schema.conversations.id, id));
    return true;
  } catch (error) {
    console.error('Error updating conversation:', error);
    return false;
  }
}

/**
 * Message Operations
 */
export async function getConversationMessages(conversationId: string) {
  try {
    const result = await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.conversationId, conversationId))
      .orderBy(asc(schema.messages.createdAt));
    
    return result.map(m => ({
      id: m.id,
      conversation_id: m.conversationId,
      role: m.role,
      content: m.content,
      audio_url: m.audioUrl,
      created_at: m.createdAt?.toISOString() || null,
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function createMessage(conversationId: string, role: string, content: string, audioUrl?: string) {
  try {
    const id = crypto.randomUUID();
    await db.insert(schema.messages).values({
      id,
      conversationId,
      role,
      content,
      audioUrl: audioUrl || null,
    });
    
    // Update conversation timestamp
    await updateConversationTimestamp(conversationId);
    
    return {
      id,
      conversation_id: conversationId,
      role,
      content,
      audio_url: audioUrl || null,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creating message:', error);
    return null;
  }
}

/**
 * Profile Operations
 */
export async function getProfile(userId: string) {
  try {
    const result = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);
    
    if (result.length === 0) return null;
    
    return result[0];
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function createProfile(userId: string, email: string, fullName?: string) {
  try {
    await db.insert(schema.profiles).values({
      id: userId,
      email,
      fullName: fullName || null,
    });
    return true;
  } catch (error) {
    console.error('Error creating profile:', error);
    return false;
  }
}

export async function updateProfile(userId: string, updates: { fullName?: string; avatarUrl?: string }) {
  try {
    await db
      .update(schema.profiles)
      .set({
        fullName: updates.fullName,
        avatarUrl: updates.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, userId));
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

/**
 * User Conversations with Personality (for conversations list page)
 */
export async function getUserConversationsWithPersonalities(userId: string) {
  try {
    const conversations = await getUserConversations(userId);
    
    // Fetch personalities for each conversation
    const withPersonalities = await Promise.all(
      conversations.map(async (conv) => {
        const personality = await getPersonalityById(conv.personality_id);
        return {
          ...conv,
          personalities: personality,
        };
      })
    );
    
    return withPersonalities;
  } catch (error) {
    console.error('Error fetching conversations with personalities:', error);
    return [];
  }
}
