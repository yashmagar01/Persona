import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const messageVariants = cva(
  "group/message relative flex w-full gap-3 p-4 data-[from=user]:flex-row-reverse",
  {
    variants: {},
    defaultVariants: {},
  }
)

const Message = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof messageVariants> & {
      from: "user" | "assistant"
    }
>(({ className, from, ...props }, ref) => (
  <div
    ref={ref}
    data-from={from}
    className={cn(messageVariants(), className)}
    {...props}
  />
))
Message.displayName = "Message"

const messageContentVariants = cva(
  "flex flex-col gap-2 overflow-hidden rounded-2xl px-4 py-3 text-sm group-data-[from=user]/message:bg-primary group-data-[from=user]/message:text-primary-foreground group-data-[from=assistant]/message:bg-secondary",
  {
    variants: {
      variant: {
        contained: "",
        flat: "bg-transparent px-0",
      },
    },
    defaultVariants: {
      variant: "contained",
    },
  }
)

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof messageContentVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(messageContentVariants({ variant }), className)}
    {...props}
  />
))
MessageContent.displayName = "MessageContent"

const MessageAvatar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Avatar> & {
    src?: string
    name?: string
  }
>(({ className, src, name, ...props }, ref) => (
  <Avatar className={cn("size-8 shrink-0 ring-1", className)} {...props}>
    <AvatarImage src={src} />
    <AvatarFallback className="text-xs">
      {name?.slice(0, 2).toUpperCase()}
    </AvatarFallback>
  </Avatar>
))
MessageAvatar.displayName = "MessageAvatar"

export { Message, MessageContent, MessageAvatar }
