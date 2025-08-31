import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-2 border-gray-200 bg-white placeholder:text-gray-400 focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 aria-invalid:ring-red-500/20 dark:bg-gray-800 dark:border-gray-600 dark:placeholder:text-gray-500 dark:focus-visible:border-orange-400 dark:focus-visible:ring-orange-400 flex min-h-20 w-full rounded-lg px-4 py-3 text-sm shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300 dark:hover:border-gray-500 resize-vertical",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
