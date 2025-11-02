# Error Handling & Recovery Implementation

## ✅ Complete Implementation Summary

This document describes the comprehensive error handling system implemented across the chat application.

---

## 1. Error Boundaries

### ErrorBoundary Component (`src/components/ErrorBoundary.tsx`)

**Features:**
- Catches React render errors at component level
- Shows user-friendly fallback UI (no stack traces to users)
- Provides "Try Again" button to reset error state
- Logs errors to console in development mode
- Supports custom error handlers (e.g., for error tracking services)
- Two variants: `ErrorBoundary` (full-screen) and `InlineErrorBoundary` (inline)

**Usage:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Or inline for smaller components
<InlineErrorBoundary>
  <SmallerComponent />
</InlineErrorBoundary>
```

**Implementation:**
- Wraps entire App in `ErrorBoundary`
- Wraps ChatContainer sub-components in `InlineErrorBoundary`
- Provides graceful degradation without crashing entire app

---

## 2. Toast Notifications

### Toast Utilities (`src/lib/toast.utils.ts`)

**Configuration:**
- Position: `top-right` (consistent across app)
- Success toasts: auto-dismiss after **3 seconds**
- Error toasts: auto-dismiss after **5 seconds**
- Info toasts: auto-dismiss after **3 seconds**
- Loading toasts: **no auto-dismiss** (manual control)

**API:**
```typescript
import { toast, commonToasts } from '@/lib/toast.utils';

// Basic toasts
toast.success('Operation successful');
toast.error('Something went wrong', 'Optional description');
toast.info('Information message');
toast.loading('Processing...');

// Common predefined toasts
commonToasts.messageSent();
commonToasts.messageFailed();
commonToasts.offline();
commonToasts.reconnected();
commonToasts.unauthorized();
commonToasts.forbidden();
commonToasts.serverError();
commonToasts.rateLimited();

// Promise-based toasts (loading → success/error)
toast.promise(fetchData(), {
  loading: 'Loading...',
  success: 'Loaded!',
  error: 'Failed to load'
});
```

**Examples:**
- ✅ "Message sent!" (success, 3s)
- ❌ "Failed to send message" (error, 5s)
- 🗑️ "Conversation deleted" (success, 3s)
- 📋 "Copying..." → "Copied!" (loading → success)

---

## 3. Message-Level Errors

### MessageItem Error UI (`src/features/chat/components/MessageList/MessageItem.tsx`)

**Features:**
- Failed messages show **red tint** and **error icon**
- "Failed to send" indicator with AlertCircle icon
- Error messages have `status: 'error'` in data model
- Integrates with MessageActions for retry/delete

**Visual Design:**
```
┌─────────────────────────────────────────┐
│ ⚠️ Failed to send                       │
│                                         │
│ Your message content here...            │
│                                         │
│ [Retry] [Delete]                        │
└─────────────────────────────────────────┘
  ↑ Red tint border (destructive/10)
```

### MessageActions Error Buttons (`src/features/chat/components/MessageList/MessageActions.tsx`)

**Error State Actions:**
- **Retry button** (orange): Resends failed message
- **Delete button** (red): Removes failed message from list
- Actions **always visible** for error messages (no hover required)
- Normal actions (Copy, Like, Dislike) hidden during error state

**Behavior:**
- Error actions take priority over normal actions
- Color-coded for clarity (orange = retry, red = delete)
- Tooltips provide clear guidance

---

## 4. Network Error Handling

### Network Status Hook (`src/hooks/use-network-status.ts`)

**Features:**
- Monitors `window.navigator.onLine`
- Listens to browser `online`/`offline` events
- **Auto-checks every 1 second** when offline (polls for reconnection)
- Tracks "was offline" state for reconnection toasts
- Logs status changes in development

**Returns:**
```typescript
const { isOnline, wasOffline } = useNetworkStatus();
```

### Offline Banner (`src/components/OfflineBanner.tsx`)

**Features:**
- Fixed banner at top of screen when offline
- Shows "You're offline. Check your connection." with WiFi icon
- Auto-dismisses when reconnected
- Shows "Back online" confirmation banner (green)
- Smooth slide-in/slide-out animations (Framer Motion)
- Auto-shows toasts on status change

**Visual:**
```
┌─────────────────────────────────────────┐
│ 📡 You're offline. Check your connection│  ← Red banner
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✓ Back online                           │  ← Green banner (3s)
└─────────────────────────────────────────┘
```

### ChatInput Offline Mode (`src/features/chat/components/ChatInput/ChatInput.tsx`)

**Features:**
- Input **disabled gracefully** when offline
- Shows "You're offline" indicator instead of char count
- Send button **disabled** with 50% opacity
- No error toasts on user interaction (clear visual feedback)

**Visual:**
```
┌─────────────────────────────────────────┐
│ [📎] Type message...                    │
│                                         │
│ 📡 You're offline                   [⬆️] │
└─────────────────────────────────────────┘
           ↑ Disabled indicator
```

---

## 5. API Error Responses

### Enhanced chatService (`src/features/chat/services/chatService.ts`)

**Error Class:**
```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public apiMessage?: string
  )
}
```

**Status Code Handling:**

| Code | Action | Toast | Redirect |
|------|--------|-------|----------|
| 401 | Unauthorized | "Please sign in to continue" | `/auth` |
| 403 | Forbidden | "Access denied" | No |
| 429 | Rate Limit | "Too many requests, wait..." | No |
| 500/502/503 | Server Error | "Server error, try later" | No |
| Others | Generic | Custom API message or fallback | No |

**Features:**
- Parses custom error messages from API response body
- Logs all errors with status codes
- Shows user-friendly toasts instead of technical errors
- Graceful network error handling (checks `navigator.onLine`)
- Abort error handling (doesn't show error for user-initiated stops)

**Example:**
```typescript
// API returns { error: "Rate limit exceeded" }
// User sees: "Too many requests. Wait a moment and try again." (5s toast)
// Logs: "API error: Rate limit exceeded" (statusCode: 429)
```

---

## 6. Error Logging

### Error Logger (`src/lib/errorLogger.ts`)

**Features:**
- **Development**: Logs to console with timestamps and context
- **Production**: Integrates with error tracking services (Sentry, LogRocket, etc.)
- **Never logs sensitive data**: Auto-redacts passwords, tokens, API keys, etc.
- Recursive sanitization of nested objects
- Specialized loggers for network and API errors

**API:**
```typescript
import { logError, logApiError, logNetworkError } from '@/lib/errorLogger';

// Generic error
logError('Operation failed', error, {
  component: 'ChatContainer',
  action: 'sendMessage',
  userId: 'user123'
});

// API error with status code
logApiError('Rate limit exceeded', 429, error, {
  conversationId: 'conv-123'
});

// Network error
logNetworkError(error, {
  isOnline: navigator.onLine,
  endpoint: '/api/chat'
});
```

**Sensitive Data Protection:**
```typescript
// Input
const context = {
  password: 'secret123',
  apiKey: 'sk-abc123',
  userId: 'user123'
};

// Logged
{
  password: '[REDACTED]',
  apiKey: '[REDACTED]',
  userId: 'user123'
}
```

---

## 7. Integration

### useSendMessage Hook (`src/features/chat/hooks/useSendMessage.ts`)

**Enhanced Error Handling:**
- Uses `commonToasts` for consistent messaging
- Logs all errors with context (component, action, conversationId)
- Specific error detection:
  - Abort errors → "Message stopped"
  - Rate limits → "Too many requests..."
  - Quota errors → "API quota exceeded..."
  - Generic → "Failed to send message"
- Marks failed messages with `status: 'error'`
- Stores original content in `failedMessages` Map for retry

**Error Flow:**
1. User sends message
2. Error occurs during streaming
3. Message marked as `error` status
4. Appropriate toast shown (based on error type)
5. Error logged with context
6. Message shows Retry/Delete buttons
7. User can retry (resends original content) or delete

### ChatContainer (`src/features/chat/components/ChatContainer/ChatContainer.tsx`)

**Error Boundary Integration:**
- Main container wrapped in `ErrorBoundary`
- Sub-components wrapped in `InlineErrorBoundary`:
  - ChatSidebar
  - ChatHeader
  - MessageList
  - ChatInput
- Prevents cascading failures
- Each component can fail independently

### App.tsx

**Global Integration:**
- Root-level `ErrorBoundary` wraps entire app
- `OfflineBanner` added globally (monitors all pages)
- Sonner toasts positioned `top-right` globally

---

## 8. Test Scenarios

### Recommended Test Cases:

1. **Render Error**
   - Trigger error in MessageList
   - Verify InlineErrorBoundary catches it
   - Verify other components still work
   - Click "Try Again" button

2. **Network Offline**
   - Disable network in DevTools
   - Verify offline banner appears
   - Verify input is disabled
   - Verify "You're offline" indicator
   - Re-enable network
   - Verify "Back online" banner

3. **Message Send Failure**
   - Mock API to return 500 error
   - Send message
   - Verify message marked as error (red tint)
   - Verify error icon shown
   - Verify Retry/Delete buttons appear
   - Click Retry → message resends
   - Click Delete → message removed

4. **Rate Limit**
   - Mock API to return 429
   - Send message
   - Verify "Too many requests" toast (5s)
   - Verify error logged

5. **Unauthorized**
   - Mock API to return 401
   - Send message
   - Verify "Please sign in" toast
   - Verify redirect to `/auth`

6. **Abort Message**
   - Start sending message
   - Click Stop button
   - Verify "Message stopped" toast
   - Verify no error status on message

7. **Custom API Error**
   - Mock API to return `{ error: "Custom error message" }`
   - Verify custom message shown in toast

---

## 9. File Summary

### New Files Created:
1. `src/components/ErrorBoundary.tsx` - React error boundaries
2. `src/lib/toast.utils.ts` - Toast helper functions
3. `src/lib/errorLogger.ts` - Error logging utility
4. `src/hooks/use-network-status.ts` - Network monitoring hook
5. `src/components/OfflineBanner.tsx` - Offline banner component

### Modified Files:
1. `src/App.tsx` - Added ErrorBoundary, OfflineBanner, changed toast position
2. `src/features/chat/services/chatService.ts` - Enhanced API error handling
3. `src/features/chat/hooks/useSendMessage.ts` - Updated toast imports, error logging
4. `src/features/chat/components/ChatInput/ChatInput.tsx` - Offline mode, network status
5. `src/features/chat/components/MessageList/MessageItem.tsx` - Error UI, retry/delete handlers
6. `src/features/chat/components/MessageList/MessageActions.tsx` - Retry/Delete buttons
7. `src/features/chat/components/MessageList/MessageList.tsx` - Pass retry/delete to MessageItem
8. `src/features/chat/components/ChatContainer/ChatContainer.tsx` - Wrap components in ErrorBoundary

---

## 10. Best Practices Implemented

✅ **User-Friendly Errors**: No stack traces exposed to users  
✅ **Consistent Messaging**: Standardized toasts with `commonToasts`  
✅ **Visual Feedback**: Red tint, icons, inline indicators  
✅ **Graceful Degradation**: Components fail independently  
✅ **Network Awareness**: Auto-disable input when offline  
✅ **Retry Logic**: Failed messages can be retried without duplication  
✅ **Security**: No sensitive data in logs  
✅ **Logging**: Comprehensive error tracking in dev/prod  
✅ **Status Codes**: Specific handling for 401/403/429/500  
✅ **Animations**: Smooth transitions for error states  

---

## 11. Production Checklist

Before deploying to production:

- [ ] Configure error tracking service (Sentry, LogRocket) in `errorLogger.ts`
- [ ] Test all error scenarios (see section 8)
- [ ] Verify toast auto-dismiss timings feel right (3s/5s)
- [ ] Ensure no sensitive data in production logs
- [ ] Test offline mode on mobile devices
- [ ] Verify 401 redirect works with real auth
- [ ] Test rate limiting with real API
- [ ] Check error messages are clear for non-technical users
- [ ] Verify ErrorBoundary fallback UI matches design system
- [ ] Test retry logic doesn't cause duplicate messages

---

## Success Metrics

- **Zero uncaught errors** reaching users
- **All API errors** show user-friendly messages
- **Offline mode** clearly communicated to users
- **Failed messages** can be retried or deleted
- **Error recovery** works without page refresh
- **Logs** provide enough context for debugging
