import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface ProgressCardProps {
  title: string
  completed: number
  total: number
  color: 'orange' | 'pink' | 'green'
  icon: LucideIcon
}

const colorConfig = {
  orange: {
    bgGradient: "from-orange-50 to-orange-100",
    textColor: "text-orange-600",
    progressColor: "stroke-orange-500",
    iconBg: "bg-orange-100",
    circleColor: "text-orange-200"
  },
  pink: {
    bgGradient: "from-pink-50 to-pink-100", 
    textColor: "text-pink-600",
    progressColor: "stroke-pink-500",
    iconBg: "bg-pink-100",
    circleColor: "text-pink-200"
  },
  green: {
    bgGradient: "from-green-50 to-green-100",
    textColor: "text-green-600", 
    progressColor: "stroke-green-500",
    iconBg: "bg-green-100",
    circleColor: "text-green-200"
  }
}

export function ProgressCard({ title, completed, total, color, icon: Icon }: ProgressCardProps) {
  const config = colorConfig[color]
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  
  // Calculate circle progress
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Card className={`bg-gradient-to-br ${config.bgGradient} border-0 shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-3 rounded-xl ${config.iconBg}`}>
            <Icon className={`h-6 w-6 ${config.textColor}`} />
          </div>
          
          {/* Circular Progress Indicator */}
          <div className="relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 50 50">
              {/* Background circle */}
              <circle
                cx="25"
                cy="25"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className={config.circleColor}
              />
              {/* Progress circle */}
              <circle
                cx="25"
                cy="25"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={config.progressColor}
                style={{
                  transition: 'stroke-dashoffset 0.5s ease-in-out',
                }}
              />
            </svg>
            {/* Percentage text in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold ${config.textColor}`}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Completed
            </span>
            <span className={`text-sm font-semibold ${config.textColor}`}>
              {completed.toString().padStart(2, '0')} / {total.toString().padStart(2, '0')}
            </span>
          </div>
          
          {/* Linear progress bar as secondary indicator */}
          <div className="w-full bg-white/60 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${config.progressColor.replace('stroke-', 'bg-')}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}