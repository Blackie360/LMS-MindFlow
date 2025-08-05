"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

/**
 * TouchTarget component ensures minimum touch target size for mobile accessibility
 * Follows WCAG guidelines for minimum 44px touch targets
 */
export const TouchTarget = forwardRef<HTMLDivElement, TouchTargetProps>(
  ({ children, className, asChild = false, ...props }, ref) => {
    const Component = asChild ? "div" : "div"
    
    return (
      <Component
        ref={ref}
        className={cn(
          // Minimum touch target size
          "min-h-[44px] min-w-[44px]",
          // Ensure content is centered
          "flex items-center justify-center",
          // Add padding for better touch experience
          "p-2",
          // Focus styles for keyboard navigation
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          // Hover and active states for better feedback
          "hover:bg-accent/50 active:bg-accent/70",
          // Smooth transitions
          "transition-colors duration-200",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

TouchTarget.displayName = "TouchTarget"