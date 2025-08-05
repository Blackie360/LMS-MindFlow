"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Keyboard, Command } from "lucide-react"
import { getQuickNavShortcuts, type UserRole } from "@/lib/navigation-utils"

interface KeyboardShortcutsHelpProps {
  userRole: UserRole
}

export function KeyboardShortcutsHelp({ userRole }: KeyboardShortcutsHelpProps) {
  const [open, setOpen] = useState(false)
  const shortcuts = getQuickNavShortcuts(userRole)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Keyboard className="h-4 w-4 mr-2" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate quickly around the dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-medium mb-2">Quick Navigation</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Quick search</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded border">
                  <Command className="h-3 w-3 inline mr-1" />K
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Go to dashboard</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded border">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Section Shortcuts */}
          <div>
            <h4 className="text-sm font-medium mb-2">Section Shortcuts</h4>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between text-sm">
                  <span>{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs bg-muted rounded border">
                    Alt + {shortcut.key.toUpperCase()}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* General Shortcuts */}
          <div>
            <h4 className="text-sm font-medium mb-2">General</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Close dialogs</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded border">Esc</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Navigate with Tab</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded border">Tab</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 Tip: Shortcuts work when you're not typing in input fields. Press{" "}
            <kbd className="px-1 py-0.5 text-xs bg-background rounded">⌘K</kbd> or{" "}
            <kbd className="px-1 py-0.5 text-xs bg-background rounded">Ctrl+K</kbd> to open quick search.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}