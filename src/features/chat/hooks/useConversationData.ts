// useConversationData.ts
// Purpose: Public aggregation of conversation data hooks for convenience.
// TODO: Extend with additional selectors and composed data if needed.

export {
  useConversations,
  useConversation,
  useConversationMessages,
  useCreateConversation,
  useUpdateConversation,
  useDeleteConversation,
  useSaveMessage,
  useOptimisticMessage,
  chatKeys,
} from './useConversations';
