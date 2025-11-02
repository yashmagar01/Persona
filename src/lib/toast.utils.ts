import { toast as sonnerToast } from 'sonner';

/**
 * Toast configuration constants
 */
const TOAST_CONFIG = {
  position: 'top-right' as const,
  duration: {
    success: 3000,
    error: 5000,
    info: 3000,
    loading: Infinity, // Loading toasts don't auto-dismiss
  },
};

/**
 * Standardized toast utilities with consistent styling and behavior
 * Uses sonner package with predefined durations and positioning
 */
export const toast = {
  /**
   * Show success toast (auto-dismisses after 3 seconds)
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: TOAST_CONFIG.duration.success,
      position: TOAST_CONFIG.position,
    });
  },

  /**
   * Show error toast (auto-dismisses after 5 seconds)
   */
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: TOAST_CONFIG.duration.error,
      position: TOAST_CONFIG.position,
    });
  },

  /**
   * Show info toast (auto-dismisses after 3 seconds)
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      duration: TOAST_CONFIG.duration.info,
      position: TOAST_CONFIG.position,
    });
  },

  /**
   * Show loading toast (doesn't auto-dismiss, returns ID for updating)
   */
  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
      position: TOAST_CONFIG.position,
    });
  },

  /**
   * Show promise toast (loading → success/error based on promise result)
   */
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
      position: TOAST_CONFIG.position,
      duration: TOAST_CONFIG.duration.success,
    });
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Update an existing toast (useful for loading → success/error)
   */
  update: (
    toastId: string | number,
    options: {
      type?: 'success' | 'error' | 'info';
      message?: string;
      description?: string;
    }
  ) => {
    const { type = 'info', message, description } = options;
    
    // Dismiss the old toast
    sonnerToast.dismiss(toastId);
    
    // Show new toast with updated content
    switch (type) {
      case 'success':
        return toast.success(message || '', description);
      case 'error':
        return toast.error(message || '', description);
      default:
        return toast.info(message || '', description);
    }
  },
};

/**
 * Common toast messages for consistency across the app
 */
export const commonToasts = {
  // Message operations
  messageSent: () => toast.success('Message sent!'),
  messageFailed: () => toast.error('Failed to send message'),
  messageRetrying: () => toast.info('Retrying message...'),
  messageStopped: () => toast.info('Message generation stopped'),
  
  // Copy operations
  copying: () => toast.loading('Copying to clipboard...'),
  copied: () => toast.success('Copied!'),
  copyFailed: () => toast.error('Failed to copy'),
  
  // Conversation operations
  conversationCreated: () => toast.success('New conversation created'),
  conversationDeleted: () => toast.success('Conversation deleted'),
  conversationRenamed: () => toast.success('Conversation renamed'),
  conversationFailed: () => toast.error('Failed to update conversation'),
  
  // Network errors
  offline: () => toast.error("You're offline", "Check your connection"),
  reconnected: () => toast.success("You're back online"),
  
  // API errors
  unauthorized: () => toast.error('Please sign in to continue'),
  forbidden: () => toast.error('Access denied'),
  serverError: () => toast.error('Server error', 'Try again later'),
  rateLimited: () => toast.error('Too many requests', 'Wait a moment and try again'),
  
  // Generic
  genericError: (message?: string) => 
    toast.error(message || 'Something went wrong'),
};
