import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700 hover:shadow-xl transform hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl transform hover:-translate-y-0.5",
        outline:
          "border-2 border-orange-500 bg-transparent text-orange-600 shadow-sm hover:bg-orange-50 hover:border-orange-600 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950/20",
        secondary:
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:-translate-y-0.5",
        ghost:
          "text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-950/20 dark:hover:text-orange-400",
        link: "text-orange-600 underline-offset-4 hover:text-orange-700 hover:underline",
        success:
          "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:-translate-y-0.5",
        warning:
          "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg hover:from-yellow-600 hover:to-yellow-700 hover:shadow-xl transform hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-6 py-2.5 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-4 py-2 has-[>svg]:px-3",
        lg: "h-12 rounded-lg px-8 py-3 has-[>svg]:px-6 text-base",
        xl: "h-14 rounded-xl px-10 py-4 has-[>svg]:px-8 text-lg",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
