"use client"

import * as React from "react"
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Conversation = React.forwardRef<
  React.ElementRef<typeof StickToBottom>,
  React.ComponentPropsWithoutRef<typeof StickToBottom>
>(({ className, initial = "smooth", resize = "smooth", ...props }, ref) => (
  <StickToBottom
    ref={ref}
    className={cn("flex h-full flex-col", className)}
    initial={initial}
    resize={resize}
    {...props}
  />
))
Conversation.displayName = "Conversation"

const ConversationContent = React.forwardRef<
  React.ElementRef<typeof StickToBottom.Content>,
  React.ComponentPropsWithoutRef<typeof StickToBottom.Content>
>(({ className, ...props }, ref) => (
  <StickToBottom.Content
    ref={ref}
    className={cn("flex-1 overflow-y-auto px-4", className)}
    {...props}
  />
))
ConversationContent.displayName = "ConversationContent"

interface ConversationEmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
}

const ConversationEmptyState = React.forwardRef<
  HTMLDivElement,
  ConversationEmptyStateProps
>(
  (
    {
      title = "No messages yet",
      description,
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex min-h-full flex-col items-center justify-center gap-2 text-center",
        className
      )}
      {...props}
    >
      {children ? (
        children
      ) : (
        <>
          {icon && <div className="mb-2">{icon}</div>}
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </>
      )}
    </div>
  )
)
ConversationEmptyState.displayName = "ConversationEmptyState"

const ConversationScrollButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext()

  if (isAtBottom) return null

  return (
    <Button
      ref={ref}
      size="icon"
      variant="outline"
      className={cn(
        "absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full shadow-md",
        className
      )}
      onClick={scrollToBottom}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </Button>
  )
})
ConversationScrollButton.displayName = "ConversationScrollButton"

export {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
}
