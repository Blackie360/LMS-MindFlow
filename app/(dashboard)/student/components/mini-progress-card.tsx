import { LucideIcon } from "lucide-react"
import { ProgressIndicator } from "./progress-indicator"

interface MiniProgressCardProps {
  title: string
  completed: number
  total: number
  color: 'orange' | 'pink' | 'green' | 'blue' | 'purple'
  icon: LucideIcon
  className?: string
}

const colorConfig = {
  orange: {
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    textColor: "text-orange-600"
  },
  pink: {
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200", 
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    textColor: "text-pink-600"
  },
  green: {
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconBg: "bg-green-100", 
    iconColor: "text-green-600",
    textColor: "text-green-600"
  },
  blue: {
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600", 
    textColor: "text-blue-600"
  },
  purple: {
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    textColor: "text-purple-600"
  }
}

export function MiniProgressCard({ 
  title, 
  completed, 
  total, 
  color, 
  icon: Icon,
  className = ""
}: MiniProgressCardProps) {
  const config = colorConfig[color]
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 hover:shadow-sm transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${config.iconBg}`}>
            <Icon className={`h-4 w-4 ${config.iconColor}`} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            <p className="text-xs text-gray-600">
              {completed} of {total} completed
            </p>
          </div>
        </div>
        
        <ProgressIndicator
          percentage={percentage}
          size="sm"
          color={color}
          showPercentage={true}
          animated={true}
        />
      </div>
    </div>
  )
}