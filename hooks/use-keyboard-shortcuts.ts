"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getQuickNavShortcuts, navigateWithHistory, type UserRole } from "@/lib/navigation-utils"

interface UseKeyboardShortcutsProps {
  userRole: UserRole
  enabled?: boolean
}

export function useKeyboardShortcuts({ userRole, enabled = true }: UseKeyboardShortcutsProps) {
  const router = useRouter()

  useEffect(() => {
    if (!enabled) return

    const shortcuts = getQuickNavShortcuts(userRole)

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return
      }

      // Handle Alt + key combinations for navigation
      if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        const shortcut = shortcuts.find(s => s.key.toLowerCase() === event.key.toLowerCase())
        
        if (shortcut) {
          event.preventDefault()
          navigateWithHistory(router, shortcut.href)
        }
      }

      // Handle Escape to go back to dashboard
      if (event.key === "Escape" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const dashboardShortcut = shortcuts.find(s => s.key === "d")
        if (dashboardShortcut) {
          event.preventDefault()
          navigateWithHistory(router, dashboardShortcut.href)
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [userRole, enabled, router])

  return {
    shortcuts: getQuickNavShortcuts(userRole)
  }
}