"use client"

import * as React from "react"
import { Streamdown } from "streamdown"

import { cn } from "@/lib/utils"

export interface ResponseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Response = React.memo(
  ({ children, className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      {...props}
    >
      {String(children)}
    </Streamdown>
  )
)

Response.displayName = "Response"
