import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md",
        secondary:
          "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md",
        outline:
          "border-2 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/20 dark:text-orange-300",
        success:
          "border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md",
        warning:
          "border-transparent bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md",
        info:
          "border-transparent bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md",
        student:
          "border-transparent bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md",
        instructor:
          "border-transparent bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md",
        admin:
          "border-transparent bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
