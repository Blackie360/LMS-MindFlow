"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { toast } from "@/hooks/use-toast"
import { Trash2, Loader2 } from "lucide-react"

interface DeleteCourseButtonProps {
  courseId: string
  courseName: string
}

export function DeleteCourseButton({ courseId, courseName }: DeleteCourseButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${courseName}"? This will also delete all lessons and student progress. This action cannot be undone.`,
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      const { error } = await supabase.from("courses").delete().eq("id", courseId)

      if (error) throw error

      toast({
        title: "Course Deleted",
        description: `"${courseName}" has been deleted successfully.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Delete course error:", error)
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  )
}
