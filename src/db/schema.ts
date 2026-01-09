/**
 * Turso Database Schema
 * SQLite schema for Persona app using Drizzle ORM
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * User profiles table
 */
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(), // Firebase UID
  email: text('email'),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

/**
 * Historical personalities table
 */
export const personalities = sqliteTable('personalities', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').unique().notNull(),
  displayName: text('display_name').notNull(),
  era: text('era').notNull(),
  shortBio: text('short_bio').notNull(),
  speakingStyle: text('speaking_style').notNull(),
  valuesPillars: text('values_pillars', { mode: 'json' }).$type<string[]>(),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

/**
 * Conversations table
 */
export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(), // Firebase UID
  personalityId: text('personality_id').notNull(),
  title: text('title'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

/**
 * Messages table
 */
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text('conversation_id').notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  audioUrl: text('audio_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Type exports for use in components
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Personality = typeof personalities.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
