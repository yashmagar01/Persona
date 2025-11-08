import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Chat Interface Loading Skeleton
 * Displays while chat conversation and personality data is being loaded
 * 
 * Features:
 * - Personality header skeleton with avatar and name
 * - Typing dots animation with sequential pulse
 * - "Initializing conversation..." message
 * - Disabled input field with loading indicator
 * - Matches actual chat interface layout
 * - Smooth fade-in transition
 */

export function ChatLoadingSkeleton() {
  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted flex flex-col animate-fadeIn">
      {/* Header Skeleton */}
      <header className="bg-card border-b border-border shadow-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Button variant="ghost" size="icon" disabled>
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar Skeleton */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-800/60 flex-shrink-0 animate-pulse flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              
              {/* Name & Era Skeleton */}
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-800/60 rounded-md w-40 animate-pulse"></div>
                <div className="h-4 bg-gray-800/40 rounded-md w-24 animate-pulse delay-75"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            {/* Welcome Message Skeleton */}
            <div className="space-y-3">
              <div className="h-6 bg-gray-800/60 rounded-md w-3/4 mx-auto animate-pulse"></div>
              <div className="h-6 bg-gray-800/40 rounded-md w-2/3 mx-auto animate-pulse delay-100"></div>
            </div>

            {/* Animated Typing Dots */}
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"
                  style={{ animationDelay: '0ms' }}
                ></span>
                <span 
                  className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"
                  style={{ animationDelay: '200ms' }}
                ></span>
                <span 
                  className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"
                  style={{ animationDelay: '400ms' }}
                ></span>
              </div>
              
              {/* Status Text */}
              <p className="text-sm text-muted-foreground animate-pulse">
                Initializing conversation...
              </p>
            </div>
          </div>
        </div>

        {/* Input Area Skeleton */}
        <div className="border-t border-border bg-card flex-shrink-0">
          <div className="container mx-auto max-w-4xl px-4 py-4">
            <div className="flex gap-2">
              {/* Input Skeleton */}
              <div className="flex-1 relative">
                <div className="h-10 bg-gray-800/40 rounded-lg border border-gray-700/50 flex items-center px-4">
                  <span className="text-sm text-gray-600">Type a message...</span>
                </div>
              </div>
              
              {/* Send Button Skeleton */}
              <Button 
                size="icon" 
                disabled
                className="bg-gray-800/60 hover:bg-gray-800/60 cursor-not-allowed"
              >
                <div className="w-4 h-4 rounded-full border-2 border-gray-600 border-t-transparent animate-spin"></div>
              </Button>
            </div>
            
            {/* Helper Text */}
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Connecting to {" "}
              <span className="inline-block w-20 h-3 bg-gray-800/40 rounded animate-pulse align-middle"></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal Chat Loading State
 * Lighter version for faster initial loads
 */
export function ChatLoadingMinimal() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-4">
        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-2">
          <span 
            className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"
            style={{ animationDelay: '0ms' }}
          ></span>
          <span 
            className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"
            style={{ animationDelay: '200ms' }}
          ></span>
          <span 
            className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"
            style={{ animationDelay: '400ms' }}
          ></span>
        </div>
        
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    </div>
  );
}
