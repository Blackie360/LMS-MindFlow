import { BookOpen, FileText, GraduationCap } from "lucide-react"
import { ProgressCard } from "./progress-card"
import type { StudentProgressStats } from "../lib/student-data"

interface ProgressStatsCardsProps {
  stats: StudentProgressStats
}

export function ProgressStatsCards({ stats }: ProgressStatsCardsProps) {
  const progressCards = [
    {
      title: "Lessons",
      completed: stats.lessonsCompleted,
      total: stats.totalLessons,
      color: "orange" as const,
      icon: BookOpen
    },
    {
      title: "Assignments", 
      completed: stats.assignmentsCompleted,
      total: stats.totalAssignments,
      color: "pink" as const,
      icon: FileText
    },
    {
      title: "Tests",
      completed: stats.testsCompleted,
      total: stats.totalTests,
      color: "green" as const,
      icon: GraduationCap
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {progressCards.map((card) => (
        <ProgressCard
          key={card.title}
          title={card.title}
          completed={card.completed}
          total={card.total}
          color={card.color}
          icon={card.icon}
        />
      ))}
    </div>
  )
}