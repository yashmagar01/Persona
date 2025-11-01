import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const messageVariants = cva(
  "group/message relative flex w-full gap-3 p-4 data-[from=user]:flex-row-reverse animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out",
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
  "flex flex-col gap-2 overflow-hidden rounded-2xl px-5 py-3 text-sm shadow-md transition-all duration-300 hover:shadow-lg group-data-[from=user]/message:bg-black group-data-[from=user]/message:text-white group-data-[from=assistant]/message:bg-gray-100 group-data-[from=assistant]/message:text-gray-900 dark:group-data-[from=assistant]/message:bg-gray-800 dark:group-data-[from=assistant]/message:text-gray-100",
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
  <Avatar className={cn("size-10 shrink-0 ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm transition-transform duration-300 hover:scale-110", className)} {...props}>
    <AvatarImage src={src} />
    <AvatarFallback className="text-xs font-semibold bg-black text-white">
      {name?.slice(0, 2).toUpperCase()}
    </AvatarFallback>
  </Avatar>
))
MessageAvatar.displayName = "MessageAvatar"

export { Message, MessageContent, MessageAvatar }
