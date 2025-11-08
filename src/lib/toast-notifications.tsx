import toast, { Renderable } from 'react-hot-toast';
import { Info, CheckCircle, AlertCircle, XCircle, X, Lock } from 'lucide-react';

/**
 * Custom toast notification utilities with orange theme
 */

interface ToastOptions {
  duration?: number;
  icon?: Renderable;
}

/**
 * Show an auth-required toast notification
 * Displays when users try to access restricted features without authentication
 */
export const showAuthToast = () => {
  console.log('🔒 Toast triggered! User needs authentication');
  
  toast.custom(
    (t) => (
      <div 
        className={`flex items-start gap-3 max-w-md bg-[#FF6B35] text-white rounded-lg shadow-xl p-4 ${
          t.visible ? 'animate-slide-in-right' : 'animate-fade-out'
        }`}
        style={{
          boxShadow: '0 10px 25px -5px rgba(255, 107, 53, 0.5), 0 8px 10px -6px rgba(255, 107, 53, 0.3)',
        }}
      >
        <div className="flex-shrink-0 mt-0.5">
          <Lock className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white mb-1">
            Authentication Required
          </p>
          <p className="text-sm text-white/95">
            Please sign in to view your conversations
          </p>
        </div>
        <button
          onClick={() => {
            console.log('🔒 Toast dismissed by user');
            toast.dismiss(t.id);
          }}
          className="flex-shrink-0 inline-flex text-white/80 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    {
      duration: 5000,
      position: 'top-right',
    }
  );
};

/**
 * Show a success toast with orange theme
 */
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, {
    duration: options?.duration || 3000,
    icon: options?.icon || <CheckCircle className="h-5 w-5 text-orange-500" />,
    style: {
      background: '#1f2937',
      color: '#fff',
      borderRadius: '0.5rem',
      border: '1px solid rgba(249, 115, 22, 0.3)',
      padding: '16px',
    },
  });
};

/**
 * Show an error toast
 */
export const showErrorToast = (message: string, options?: ToastOptions) => {
  toast.error(message, {
    duration: options?.duration || 4000,
    icon: options?.icon || <XCircle className="h-5 w-5 text-red-500" />,
    style: {
      background: '#1f2937',
      color: '#fff',
      borderRadius: '0.5rem',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      padding: '16px',
    },
  });
};

/**
 * Show an info toast
 */
export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast(message, {
    duration: options?.duration || 3000,
    icon: options?.icon || <Info className="h-5 w-5 text-blue-500" />,
    style: {
      background: '#1f2937',
      color: '#fff',
      borderRadius: '0.5rem',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      padding: '16px',
    },
  });
};

/**
 * Show a warning toast
 */
export const showWarningToast = (message: string, options?: ToastOptions) => {
  toast(message, {
    duration: options?.duration || 3000,
    icon: options?.icon || <AlertCircle className="h-5 w-5 text-yellow-500" />,
    style: {
      background: '#1f2937',
      color: '#fff',
      borderRadius: '0.5rem',
      border: '1px solid rgba(234, 179, 8, 0.3)',
      padding: '16px',
    },
  });
};

/**
 * Show a custom toast with full control
 */
export const showCustomToast = (
  content: ((t: any) => React.ReactNode) | string,
  options?: ToastOptions & { style?: React.CSSProperties }
) => {
  toast.custom(content as any, {
    duration: options?.duration || 3000,
    style: options?.style,
  });
};
