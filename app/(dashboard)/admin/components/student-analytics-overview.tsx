import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, UserPlus, Activity } from "lucide-react"

interface StudentAnalyticsOverviewProps {
  analytics: {
    newEnrollmentsThisWeek: number
    activeStudentsToday: number
    totalActiveStudents: number
  }
}

export function StudentAnalyticsOverview({ analytics }: StudentAnalyticsOverviewProps) {
  const analyticsCards = [
    {
      title: "New Enrollments",
      subtitle: "This Week",
      value: analytics.newEnrollmentsThisWeek,
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Today",
      subtitle: "Students Learning",
      value: analytics.activeStudentsToday,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Active",
      subtitle: "All Time",
      value: analytics.totalActiveStudents,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-4">
      {analyticsCards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-md ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Engagement Rate</span>
            <span className="font-medium">
              {analytics.totalActiveStudents > 0 
                ? Math.round((analytics.activeStudentsToday / analytics.totalActiveStudents) * 100)
                : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly Growth</span>
            <span className="font-medium text-green-600">
              +{analytics.newEnrollmentsThisWeek}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active Learners</span>
            <span className="font-medium">
              {analytics.totalActiveStudents} total
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}