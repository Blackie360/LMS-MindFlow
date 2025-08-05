"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { TouchTarget } from "./touch-target"

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
  icon?: React.ComponentType<{ className?: string }>
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  className,
  headerClassName,
  contentClassName,
  icon: Icon
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn("border rounded-lg bg-card", className)}>
      <TouchTarget
        className={cn(
          "w-full px-4 py-3 flex items-center justify-between cursor-pointer",
          "hover:bg-accent/50 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          headerClassName
        )}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </TouchTarget>
      
      {isOpen && (
        <div
          id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn("px-4 pb-4", contentClassName)}
        >
          {children}
        </div>
      )}
    </div>
  )
}