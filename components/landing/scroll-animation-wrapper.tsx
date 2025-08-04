"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface ScrollAnimationWrapperProps {
  children: React.ReactNode
}

export function ScrollAnimationWrapper({ children }: ScrollAnimationWrapperProps) {
  const ref = useScrollAnimation()

  return (
    <div ref={ref}>
      {children}
    </div>
  )
}