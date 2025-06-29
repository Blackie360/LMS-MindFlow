"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface EnrollButtonProps {
  courseId: string
  userId: string
}

export function EnrollButton({ courseId, userId }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("enrollments").insert({
        student_id: userId,
        course_id: courseId,
      })

      if (error) {
        console.error("Enrollment error:", error)

        if (error.code === "23505") {
          toast({
            title: "Already Enrolled",
            description: "You are already enrolled in this course!",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Enrollment Failed",
            description: "Failed to enroll in course. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Enrollment Successful!",
          description: "You have been enrolled in the course. Start learning now!",
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Unexpected enrollment error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred during enrollment.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleEnroll} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        "Enroll Now"
      )}
    </Button>
  )
}
