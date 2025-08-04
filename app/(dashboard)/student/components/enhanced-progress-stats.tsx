import { BookOpen, FileText, GraduationCap, Target, Clock, TrendingUp } from "lucide-react"
import { AnimatedProgressCard } from "./animated-progress-card"
import type { StudentProgressStats } from "../lib/student-data"

interface EnhancedProgressStatsProps {
  stats: StudentProgressStats
}

export function EnhancedProgressStats({ stats }: EnhancedProgressStatsProps) {
  // Calculate overall progress
  const totalItems = stats.totalLessons + stats.totalAssignments + stats.totalTests
  const completedItems = stats.lessonsCompleted + stats.assignmentsCompleted + stats.testsCompleted
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const progressCards = [
    {
      title: "Lessons",
      completed: stats.lessonsCompleted,
      total: stats.totalLessons,
      color: "orange" as const,
      icon: BookOpen,
      subtitle: "Interactive content completed",
      showTrend: true,
      trendValue: 12, // This would come from historical data
      delay: 0
    },
    {
      title: "Assignments", 
      completed: stats.assignmentsCompleted,
      total: stats.totalAssignments,
      color: "pink" as const,
      icon: FileText,
      subtitle: "Practical work submitted",
      showTrend: true,
      trendValue: 8,
      delay: 200
    },
    {
      title: "Tests",
      completed: stats.testsCompleted,
      total: stats.totalTests,
      color: "green" as const,
      icon: GraduationCap,
      subtitle: "Assessments passed",
      showTrend: true,
      trendValue: -2,
      delay: 400
    },
    {
      title: "Overall Progress",
      completed: completedItems,
      total: totalItems,
      color: "blue" as const,
      icon: Target,
      subtitle: "Total learning progress",
      showTrend: true,
      trendValue: 15,
      delay: 600
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {progressCards.map((card) => (
          <AnimatedProgressCard
            key={card.title}
            title={card.title}
            completed={card.completed}
            total={card.total}
            color={card.color}
            icon={card.icon}
            subtitle={card.subtitle}
            showTrend={card.showTrend}
            trendValue={card.trendValue}
            delay={card.delay}
          />
        ))}
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.floor(completedItems * 0.3)} completed
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Streak</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.max(1, Math.floor(overallProgress / 10))} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Goal</p>
              <p className="text-lg font-semibold text-gray-900">
                {100 - overallProgress}% to go
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}