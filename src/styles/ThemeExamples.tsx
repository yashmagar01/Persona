/**
 * Theme Usage Examples
 * Demonstrates how to use the ChatGPT-inspired theme system
 */

import React from 'react';
import { componentClasses } from '../styles/theme';

// Example 1: Using component class helpers
export function ThemeExample1() {
  return (
    <div className={componentClasses.card}>
      <h2 className="text-text-primary text-lg font-semibold mb-2">
        Card with Theme Classes
      </h2>
      <p className="text-text-secondary text-sm">
        This card uses pre-defined component classes from the theme system.
      </p>
    </div>
  );
}

// Example 2: Using Tailwind classes with theme colors
export function ThemeExample2() {
  return (
    <div className="bg-bg-secondary border border-border-primary rounded-md p-4 hover:bg-bg-hover transition-colors">
      <h2 className="text-text-primary text-lg font-semibold mb-2">
        Custom Styled Card
      </h2>
      <p className="text-text-secondary text-sm">
        This uses Tailwind utility classes with theme color tokens.
      </p>
      <button className="mt-3 bg-accent text-white hover:bg-accent-hover px-4 py-2 rounded-md transition-colors">
        Click Me
      </button>
    </div>
  );
}

// Example 3: Message bubbles (ChatGPT style)
export function ThemeExample3() {
  return (
    <div className="space-y-4 p-4">
      {/* User message */}
      <div className="flex justify-end">
        <div className={componentClasses.messageBubbleUser}>
          What is the capital of France?
        </div>
      </div>
      
      {/* Assistant message */}
      <div className="flex justify-start">
        <div className={componentClasses.messageBubbleAssistant}>
          The capital of France is Paris. It's known as the "City of Light" and is famous for landmarks like the Eiffel Tower and the Louvre Museum.
        </div>
      </div>
    </div>
  );
}

// Example 4: Input with theme
export function ThemeExample4() {
  return (
    <div className="p-4">
      <label className="block text-text-primary text-sm font-medium mb-2">
        Message
      </label>
      <textarea
        className={componentClasses.textarea}
        placeholder="Type your message..."
        rows={3}
      />
      <div className="mt-2 flex justify-end gap-2">
        <button className={componentClasses.buttonSecondary}>
          Cancel
        </button>
        <button className={componentClasses.buttonPrimary}>
          Send
        </button>
      </div>
    </div>
  );
}

// Example 5: Sidebar navigation
export function ThemeExample5() {
  const conversations = [
    { id: 1, title: 'Chat about React' },
    { id: 2, title: 'JavaScript Questions' },
    { id: 3, title: 'TypeScript Help' },
  ];

  return (
    <aside className={componentClasses.sidebar + ' w-64 h-screen p-4'}>
      <button className="w-full bg-accent text-white hover:bg-accent-hover rounded-md py-2 mb-4 transition-colors">
        + New Chat
      </button>
      
      <div className="space-y-1">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="px-3 py-2 rounded-md text-text-primary hover:bg-bg-hover cursor-pointer transition-colors"
          >
            {conv.title}
          </div>
        ))}
      </div>
    </aside>
  );
}

// Example 6: Complete chat layout
export function ThemeExampleFull() {
  return (
    <div className="h-screen flex bg-bg-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-sidebar border-r border-border-primary p-4">
        <button className={componentClasses.buttonPrimary + ' w-full mb-4'}>
          + New Chat
        </button>
        <div className="space-y-1">
          <div className="px-3 py-2 bg-bg-hover rounded-md text-text-primary">
            Current Chat
          </div>
          <div className="px-3 py-2 hover:bg-bg-hover rounded-md text-text-secondary cursor-pointer transition-colors">
            Previous Chat
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border-primary p-4">
          <h1 className="text-text-primary font-semibold">ChatGPT Clone</h1>
        </header>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-start">
            <div className={componentClasses.messageBubbleAssistant + ' max-w-2xl'}>
              Hello! How can I help you today?
            </div>
          </div>
          <div className="flex justify-end">
            <div className={componentClasses.messageBubbleUser + ' max-w-2xl'}>
              Can you explain React hooks?
            </div>
          </div>
        </div>
        
        {/* Input */}
        <div className="border-t border-border-primary p-4">
          <div className="flex gap-2">
            <input
              type="text"
              className={componentClasses.input + ' flex-1'}
              placeholder="Type your message..."
            />
            <button className={componentClasses.buttonPrimary}>
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default {
  ThemeExample1,
  ThemeExample2,
  ThemeExample3,
  ThemeExample4,
  ThemeExample5,
  ThemeExampleFull,
};
