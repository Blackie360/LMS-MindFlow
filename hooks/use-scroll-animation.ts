"use client"

import { useEffect, useRef } from "react"

export function useScrollAnimation() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate")
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    )

    const element = ref.current
    if (element) {
      // Observe all elements with fade-in-up class
      const animatedElements = element.querySelectorAll(".fade-in-up")
      animatedElements.forEach((el) => observer.observe(el))
    }

    return () => {
      if (element) {
        const animatedElements = element.querySelectorAll(".fade-in-up")
        animatedElements.forEach((el) => observer.unobserve(el))
      }
    }
  }, [])

  return ref
}