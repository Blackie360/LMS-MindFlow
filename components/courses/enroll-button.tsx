"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { ShoppingCart, CheckCircle } from "lucide-react"

interface EnrollButtonProps {
  courseId: string
  price: number
  className?: string
}

export function EnrollButton({ courseId, price, className }: EnrollButtonProps) {
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

  const handleEnroll = async () => {
    setIsEnrolling(true)

    try {
      // Simulate enrollment process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsEnrolled(true)
      toast({
        title: "Successfully Enrolled!",
        description: "You can now access all course materials.",
      })
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling in the course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  if (isEnrolled) {
    return (
      <Button className={className} disabled>
        <CheckCircle className="w-4 h-4 mr-2" />
        Enrolled
      </Button>
    )
  }

  return (
    <Button onClick={handleEnroll} disabled={isEnrolling} className={className} size="lg">
      <ShoppingCart className="w-4 h-4 mr-2" />
      {isEnrolling ? "Enrolling..." : price === 0 ? "Enroll for Free" : `Enroll for $${price.toFixed(2)}`}
    </Button>
  )
}
