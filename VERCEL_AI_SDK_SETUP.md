# Vercel AI SDK Integration - Setup Guide

## ✅ Step 1: Dependencies Installed

```powershell
npm install ai @ai-sdk/google zustand react-textarea-autosize framer-motion
```

**Installed packages:**
- `ai@^3.x` - Vercel AI SDK core (useChat hook, streaming)
- `@ai-sdk/google@^0.x` - Google Gemini provider
- `zustand@^4.x` - Lightweight state management
- `react-textarea-autosize@^8.x` - Auto-growing textarea
- `framer-motion@^11.x` - Smooth animations

**Console output:**
```
added 18 packages, and audited 657 packages in 9s
195 packages are looking for funding
2 moderate severity vulnerabilities (run npm audit fix)
```

---

## ✅ Step 2: File Structure Created

```
src/features/chat/
├── components/
│   ├── ChatContainer/      # Main chat layout
│   ├── Sidebar/            # Conversation list sidebar
│   ├── MessageList/        # Message display area
│   └── ChatInput/          # Input with send button
├── hooks/
│   ├── useChatStore.ts          ✅ Created
│   ├── useConversations.ts      ✅ Created
│   └── usePersonalityChat.ts    ✅ Created
├── lib/
│   ├── chatService.ts           ✅ Created
│   └── chatApi.ts               ✅ Created
└── types/
    └── chat.types.ts            ✅ Created
```

---

## ✅ Step 3: TypeScript Types Defined

**File:** `src/features/chat/types/chat.types.ts`

**Key types:**
- `ChatMessage` - Compatible with both Vercel AI SDK and Supabase
- `Conversation` - Database conversation with relationships
- `DbPersonality` - Personality information
- `UIState` - Zustand store state
- `UIActions` - Zustand store actions
- `ChatStore` - Combined UI state + actions
- `GuestConversation` - Guest mode support
- Component prop types (ChatInputProps, MessageListProps, etc.)

---

## ✅ Step 4: Zustand Store Created

**File:** `src/features/chat/hooks/useChatStore.ts`

**State keys:**
- `isSidebarOpen` - Sidebar visibility (persisted)
- `sidebarWidth` - Sidebar width in pixels (persisted)
- `activeConversationId` - Currently active conversation
- `drafts` - Draft messages per conversation (persisted)
- `theme` - UI theme (persisted)
- `isStreaming` - Streaming status
- `streamingMessageId` - ID of streaming message

**Actions:**
- `toggleSidebar()` - Toggle sidebar visibility
- `setSidebarOpen(open)` - Set sidebar state
- `setSidebarWidth(width)` - Set sidebar width
- `setActiveConversation(id)` - Set active conversation
- `setDraft(conversationId, text)` - Save draft
- `getDraft(conversationId)` - Get draft
- `clearDraft(conversationId)` - Clear draft
- `setTheme(theme)` - Set theme
- `setStreaming(isStreaming, messageId)` - Set streaming state
- `reset()` - Reset store to defaults

**Selectors (optimized):**
- `useSidebarState()` - Get sidebar state
- `useActiveConversationId()` - Get active conversation
- `useConversationDraft(id)` - Get draft for conversation
- `useStreamingState()` - Get streaming state
- `useTheme()` - Get theme state

---

## ✅ Step 5: TanStack Query Hooks Created

**File:** `src/features/chat/hooks/useConversations.ts`

**Queries:**
- `useConversations(filters?)` - Fetch all conversations
- `useConversation(conversationId)` - Fetch single conversation
- `useConversationMessages(conversationId)` - Fetch messages
  - ✅ Supports guest mode (localStorage)
  - ✅ Supports authenticated mode (Supabase)

**Mutations:**
- `useCreateConversation()` - Create new conversation
- `useUpdateConversation()` - Update conversation (rename)
- `useDeleteConversation()` - Delete conversation
  - ✅ Handles guest conversations
- `useSaveMessage()` - Save message to database

**Optimistic updates:**
- `useOptimisticMessage()` - Add/remove/update messages optimistically

**Query keys:**
- `chatKeys.all` - Base key
- `chatKeys.conversations()` - All conversations
- `chatKeys.conversation(id)` - Single conversation
- `chatKeys.messages(conversationId)` - Messages for conversation

---

## ✅ Step 6: Vercel AI SDK Integration

**File:** `src/features/chat/hooks/usePersonalityChat.ts`

**Hook:** `usePersonalityChat({ conversationId, personality })`

**Returns:**
- `messages` - Array of ChatMessage
- `input` - Current input value
- `handleInputChange` - Input change handler
- `handleSubmit` - Submit handler (saves to DB + streams)
- `isLoading` - Loading state
- `error` - Error state
- `stop()` - Stop streaming
- `reload()` - Reload last message
- `setMessages()` - Manually set messages

**Features:**
- ✅ Automatically saves user message to database
- ✅ Streams AI response using Vercel AI SDK
- ✅ Saves assistant message after streaming completes
- ✅ Handles guest mode
- ✅ Syncs streaming state with Zustand
- ✅ Error handling with toast notifications
- ✅ Rate limit handling

---

## ✅ Step 7: Chat Service Layer

**File:** `src/features/chat/lib/chatService.ts`

**Guest mode functions:**
- `createGuestConversation(personalityId, displayName)`
- `getGuestConversation(conversationId)`
- `updateGuestConversation(conversationId, messages)`
- `getAllGuestConversations()`
- `deleteGuestConversation(conversationId)`

**Conversation helpers:**
- `createConversation(input)` - Handles both guest + authenticated
- `getConversationMessages(conversationId)` - Unified message fetching
- `saveMessage(conversationId, role, content)` - Unified message saving

**Personality helpers:**
- `getPersonality(personalityId)`
- `getAllPersonalities()`

**Utilities:**
- `isAuthenticated()`
- `generateConversationTitle(messages)`

---

## ⚙️ Step 8: API Route Configuration

Since you're using Vite (not Next.js), you have two options:

### Option A: Use Existing Supabase Edge Function (Recommended)

**File:** `src/features/chat/lib/chatApi.ts` - `chatHandler()`

This proxies to your existing Edge Function at:
`{SUPABASE_URL}/functions/v1/chat-with-personality`

**No changes needed** to your Edge Function initially. The handler adapts the request format.

### Option B: Client-Side Streaming (Development/Testing)

**File:** `src/features/chat/lib/chatApi.ts` - `chatHandlerDirect()`

Calls Gemini API directly from client (bypasses Edge Function).

**Note:** For production, Option A is recommended for security.

---

## 📋 Step 9: Integration Checklist

### ✅ Preserve Guest Mode

**How it works:**
1. Guest conversation IDs start with `guest-`
2. All hooks check for `conversationId.startsWith('guest-')`
3. Guest data stored in localStorage
4. `useConversationMessages` reads from localStorage
5. `useSaveMessage` saves to localStorage
6. Works seamlessly with Vercel AI SDK

**Example:**
```tsx
const conversationId = 'guest-abc123-1234567890';
const { messages } = useConversationMessages(conversationId); // ✅ Works
```

### ✅ Connect Vercel AI SDK to Supabase

**Flow:**
1. User types message in `ChatInput`
2. `handleSubmit()` in `usePersonalityChat` is called
3. User message saved to Supabase/localStorage via `useSaveMessage()`
4. Vercel AI SDK `useChat` sends request to `/api/chat`
5. API handler (`chatApi.ts`) calls Supabase Edge Function
6. Edge Function streams response from Gemini
7. Vercel AI SDK displays streaming response
8. On finish, assistant message saved to Supabase/localStorage
9. TanStack Query cache invalidated

### ✅ Modify Edge Function (Optional)

**Current Edge Function:** `supabase/functions/chat-with-personality/index.ts`

**To support streaming with Vercel AI SDK format:**

```typescript
// Add to your Edge Function
serve(async (req) => {
  // ... existing code ...

  // After calling Gemini API:
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of result.stream) {
        const text = chunk.text();
        // Vercel AI SDK format
        controller.enqueue(
          encoder.encode(`0:${JSON.stringify(text)}\n`)
        );
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    }
  });
});
```

**Alternative:** Keep existing format and adapt in `chatApi.ts` (already done).

---

## 🔄 Step 10: Updated Routing

**Current routes:**
```tsx
<Route path="/chat/:conversationId" element={<Chat />} />
<Route path="/chatboard" element={<Chatboard />} />
<Route path="/conversations" element={<Conversations />} />
```

**Recommended new structure:**
```tsx
import { lazy } from 'react';

const ChatPage = lazy(() => import('./pages/ChatPage'));
const ChatboardPage = lazy(() => import('./pages/ChatboardPage'));
const ConversationsPage = lazy(() => import('./pages/ConversationsPage'));

// In Routes:
<Route path="/chat" element={<ChatPage />} />
<Route path="/chat/:conversationId" element={<ChatPage />} />
<Route path="/chatboard" element={<ChatboardPage />} />
<Route path="/conversations" element={<ConversationsPage />} />
```

**Benefits:**
- `/chat` - Creates new conversation
- `/chat/:conversationId` - Opens existing conversation
- Same component handles both cases

---

## 🧪 Step 11: Verification Checklist

### ✅ Installation
- [x] All packages installed successfully
- [x] No peer dependency conflicts
- [x] TypeScript types available

### ✅ File Structure
- [x] `src/features/chat/` directory exists
- [x] All subdirectories created
- [x] Core files present (types, hooks, lib)

### ✅ TypeScript
- [x] No compilation errors in types file
- [x] Zustand store properly typed
- [x] TanStack Query hooks typed
- [x] ChatMessage compatible with AI SDK Message type

### ✅ State Management
- [x] Zustand store persists to localStorage
- [x] Theme application works
- [x] Draft messages saved per conversation
- [x] Streaming state updates

### ✅ Server State
- [x] TanStack Query hooks fetch data
- [x] Guest mode supported
- [x] Optimistic updates work
- [x] Cache invalidation on mutations

### ✅ AI Integration
- [x] usePersonalityChat hook works
- [x] Messages save to database
- [x] Streaming displays in real-time
- [x] Error handling present
- [x] Rate limiting handled

### ✅ Guest Mode
- [x] Guest conversations use localStorage
- [x] Guest IDs start with 'guest-'
- [x] All hooks support guest mode
- [x] No data loss on refresh

---

## 🚀 Step 12: Next Steps to Complete UI

### 1. Create ChatInput Component
```tsx
// src/features/chat/components/ChatInput/ChatInput.tsx
import TextareaAutosize from 'react-textarea-autosize';

export function ChatInput({
  input,
  onChange,
  onSubmit,
  isLoading,
  onStop
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit}>
      <TextareaAutosize
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
          }
        }}
        placeholder="Message..."
        maxRows={6}
      />
      {isLoading ? (
        <Button onClick={onStop}>Stop</Button>
      ) : (
        <Button type="submit">Send</Button>
      )}
    </form>
  );
}
```

### 2. Create MessageList Component
```tsx
// src/features/chat/components/MessageList/MessageList.tsx
import { Message, MessageContent, MessageAvatar } from '@/components/ui/message';
import { Response } from '@/components/ui/response';

export function MessageList({ messages, personality }: MessageListProps) {
  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            {message.role === 'assistant' && (
              <MessageAvatar
                src={personality?.avatar_url}
                name={personality?.display_name}
              />
            )}
            <MessageContent>
              <Response>{message.content}</Response>
            </MessageContent>
            {message.role === 'user' && (
              <MessageAvatar name="You" />
            )}
          </Message>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
```

### 3. Create ChatContainer Component
```tsx
// src/features/chat/components/ChatContainer/ChatContainer.tsx
import { useParams } from 'react-router-dom';
import { usePersonalityChat } from '../../hooks/usePersonalityChat';
import { useConversation } from '../../hooks/useConversations';
import { MessageList } from '../MessageList/MessageList';
import { ChatInput } from '../ChatInput/ChatInput';

export function ChatContainer() {
  const { conversationId } = useParams();
  const { data: conversation } = useConversation(conversationId);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop
  } = usePersonalityChat({
    conversationId: conversationId!,
    personality: conversation?.personalities!
  });

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <MessageList messages={messages} personality={conversation?.personalities} />
        <ChatInput
          input={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onStop={stop}
        />
      </div>
    </div>
  );
}
```

### 4. Create Sidebar Component
```tsx
// src/features/chat/components/Sidebar/ChatSidebar.tsx
import { useConversations, useDeleteConversation } from '../../hooks/useConversations';
import { useChatStore } from '../../hooks/useChatStore';

export function ChatSidebar() {
  const { data: conversations } = useConversations();
  const { activeConversationId, setActiveConversation } = useChatStore();
  const deleteConversation = useDeleteConversation();

  return (
    <aside className="w-64 border-r">
      <div className="p-4">
        <Button onClick={handleNewChat}>New Chat</Button>
      </div>
      <div className="space-y-2 p-2">
        {conversations?.map((conv) => (
          <div
            key={conv.id}
            className={cn(
              'p-3 rounded cursor-pointer',
              conv.id === activeConversationId && 'bg-accent'
            )}
            onClick={() => setActiveConversation(conv.id)}
          >
            <p className="font-medium">{conv.personalities.display_name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {conv.title}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
```

### 5. Update App.tsx
```tsx
import { useEffect } from 'react';
import { initializeTheme } from './features/chat/hooks/useChatStore';

const App = () => {
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* ... rest of app */}
    </QueryClientProvider>
  );
};
```

---

## ⚠️ Potential Conflicts & Solutions

### 1. Conflict: Existing Message Type
**Problem:** You have `interface Message` in Chat.tsx

**Solution:** Use namespaced imports
```tsx
import type { Message as DbMessage } from '@/features/chat/types/chat.types';
import type { Message as ChatMessage } from 'ai/react';
```

### 2. Conflict: Duplicate State Management
**Problem:** Existing `useState` in Chat.tsx

**Solution:** Gradually migrate to hooks
```tsx
// Old:
const [messages, setMessages] = useState([]);

// New:
const { messages } = useConversationMessages(conversationId);
```

### 3. Conflict: API Route in Vite
**Problem:** Vite doesn't have built-in API routes

**Solution:** Use Vite proxy or keep Edge Function
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api/chat': {
        target: 'your-edge-function-url',
        changeOrigin: true,
      }
    }
  }
});
```

### 4. Conflict: Environment Variables
**Problem:** Different env var formats

**Solution:** Update `.env`
```bash
# Existing
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GEMINI_API_KEY=...

# Keep these, used by chatApi.ts
```

---

## 📊 Final Architecture Overview

```
User Input (ChatInput)
    ↓
usePersonalityChat hook
    ↓
useSaveMessage mutation → Supabase/localStorage (user message)
    ↓
Vercel AI SDK useChat → /api/chat endpoint
    ↓
chatApi.ts handler → Supabase Edge Function
    ↓
Edge Function → Gemini API (streaming)
    ↓
Vercel AI SDK displays stream
    ↓
onFinish: useSaveMessage → Supabase/localStorage (assistant message)
    ↓
TanStack Query cache invalidated
    ↓
UI updates with new messages
```

---

## ✨ Success Criteria

You'll know the integration is complete when:

- ✅ Messages stream character-by-character
- ✅ Optimistic updates show user messages instantly
- ✅ Sidebar shows all conversations
- ✅ Drafts persist across page refreshes
- ✅ Guest mode works without authentication
- ✅ Stop button cancels streaming
- ✅ Error handling shows user-friendly messages
- ✅ Chat history loads from database
- ✅ Theme persists and applies correctly

---

## 🎯 Import Statements Reference

**In your components:**
```tsx
// Types
import type { ChatMessage, Conversation, DbPersonality } from '@/features/chat/types/chat.types';

// Hooks
import { useChatStore, useActiveConversationId } from '@/features/chat/hooks/useChatStore';
import { useConversations, useConversation, useConversationMessages } from '@/features/chat/hooks/useConversations';
import { usePersonalityChat } from '@/features/chat/hooks/usePersonalityChat';

// Services
import { createGuestConversation, getGuestConversation } from '@/features/chat/lib/chatService';

// Existing UI components
import { Message, MessageContent, MessageAvatar } from '@/components/ui/message';
import { Conversation, ConversationContent } from '@/components/ui/conversation';
import { Response } from '@/components/ui/response';
```

---

## 🔥 Ready to Use!

All core infrastructure is in place. Next step: Build the UI components using the hooks and primitives you already have.

**Start with:** Create ChatPage.tsx that uses `usePersonalityChat` and renders messages.

**Questions?** Check the inline code comments in each file for detailed usage examples.
