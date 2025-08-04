import { Card, CardContent } from "@/components/ui/card"
import { Users, BookOpen, UserCheck, TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react"
import type { PlatformStats } from "../lib/admin-data"

interface PlatformStatsCardsProps {
  stats: PlatformStats
}

export function PlatformStatsCards({ stats }: PlatformStatsCardsProps) {
  const statCards = [
    {
      title: "Total Courses",
      value: stats.totalCourses.toLocaleString(),
      icon: BookOpen,
      color: 'blue' as const,
      description: "Active courses on platform",
      trend: stats.trends.coursesThisWeek > 0 ? 'up' as const : 'stable' as const,
      trendValue: stats.trends.coursesThisWeek,
      trendLabel: `${stats.trends.coursesThisWeek} this week`
    },
    {
      title: "Total Students", 
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      color: 'green' as const,
      description: "Registered learners",
      trend: stats.trends.studentsThisWeek > 0 ? 'up' as const : 'stable' as const,
      trendValue: stats.trends.studentsThisWeek,
      trendLabel: `${stats.trends.studentsThisWeek} this week`
    },
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments.toLocaleString(),
      icon: UserCheck,
      color: 'purple' as const,
      description: "Course enrollments",
      trend: stats.trends.enrollmentsThisWeek > 0 ? 'up' as const : 'stable' as const,
      trendValue: stats.trends.enrollmentsThisWeek,
      trendLabel: `${stats.trends.enrollmentsThisWeek} this week`
    },
    {
      title: "Completion Rate",
      value: `${stats.averageCompletionRate}%`,
      icon: TrendingUp,
      color: 'orange' as const,
      description: "Average completion rate",
      trend: stats.trends.completionTrend,
      trendValue: stats.averageCompletionRate,
      trendLabel: stats.trends.completionTrend === 'up' ? 'Trending up' : 
                  stats.trends.completionTrend === 'down' ? 'Trending down' : 'Stable'
    }
  ]

  const colorConfig = {
    blue: {
      bgGradient: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
      iconBg: "bg-blue-100",
      progressColor: "bg-blue-500"
    },
    green: {
      bgGradient: "from-green-50 to-green-100", 
      textColor: "text-green-600",
      iconBg: "bg-green-100",
      progressColor: "bg-green-500"
    },
    purple: {
      bgGradient: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
      iconBg: "bg-purple-100", 
      progressColor: "bg-purple-500"
    },
    orange: {
      bgGradient: "from-orange-50 to-orange-100",
      textColor: "text-orange-600",
      iconBg: "bg-orange-100",
      progressColor: "bg-orange-500"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.icon
        const config = colorConfig[card.color]
        const TrendIcon = card.trend === 'up' ? ArrowUp : card.trend === 'down' ? ArrowDown : Minus
        
        return (
          <Card key={index} className={`bg-gradient-to-br ${config.bgGradient} border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${config.iconBg}`}>
                  <Icon className={`h-6 w-6 ${config.textColor}`} />
                </div>
                
                {/* Trend Indicator */}
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  card.trend === 'up' 
                    ? 'bg-green-100 text-green-700' 
                    : card.trend === 'down' 
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <TrendIcon className="h-3 w-3" />
                  <span>{card.title === "Completion Rate" ? card.trendLabel : `+${card.trendValue}`}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">
                    {card.title}
                  </h3>
                </div>
                
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {card.value}
                </div>
                
                <p className="text-xs text-gray-500 mb-2">
                  {card.description}
                </p>
                
                {/* Additional metrics */}
                <div className="text-xs text-gray-400">
                  {card.trendLabel}
                </div>
                
                {/* Visual progress indicator for completion rate */}
                {card.title === "Completion Rate" && (
                  <div className="w-full bg-white/60 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${config.progressColor}`}
                      style={{ width: `${stats.averageCompletionRate}%` }}
                    />
                  </div>
                )}
                
                {/* Mini bar chart for other metrics */}
                {card.title !== "Completion Rate" && card.trendValue > 0 && (
                  <div className="flex items-end space-x-1 mt-3 h-6">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-sm transition-all duration-300 ${config.progressColor} opacity-60`}
                        style={{ 
                          height: `${Math.max(20, Math.min(100, (i + 1) * 20 + Math.random() * 20))}%` 
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}