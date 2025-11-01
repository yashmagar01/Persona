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
  "flex flex-col gap-2 overflow-hidden rounded-2xl px-5 py-3 text-sm shadow-sm transition-all group-data-[from=user]/message:bg-gradient-to-br group-data-[from=user]/message:from-orange-500 group-data-[from=user]/message:to-orange-600 group-data-[from=user]/message:text-white group-data-[from=assistant]/message:bg-gradient-to-br group-data-[from=assistant]/message:from-emerald-500 group-data-[from=assistant]/message:to-emerald-600 group-data-[from=assistant]/message:text-white",
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
  <Avatar className={cn("size-10 shrink-0 ring-2 ring-white shadow-md", className)} {...props}>
    <AvatarImage src={src} />
    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-slate-600 to-slate-700 text-white">
      {name?.slice(0, 2).toUpperCase()}
    </AvatarFallback>
  </Avatar>
))
MessageAvatar.displayName = "MessageAvatar"

export { Message, MessageContent, MessageAvatar }
