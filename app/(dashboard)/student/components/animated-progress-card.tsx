"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface AnimatedProgressCardProps {
  title: string
  completed: number
  total: number
  color: 'orange' | 'pink' | 'green' | 'blue' | 'purple'
  icon: LucideIcon
  subtitle?: string
  showTrend?: boolean
  trendValue?: number
  delay?: number
}

const colorConfig = {
  orange: {
    bgGradient: "from-orange-50 via-orange-50 to-orange-100",
    textColor: "text-orange-600",
    progressColor: "stroke-orange-500",
    iconBg: "bg-orange-100",
    circleColor: "text-orange-200",
    shadowColor: "shadow-orange-100"
  },
  pink: {
    bgGradient: "from-pink-50 via-pink-50 to-pink-100", 
    textColor: "text-pink-600",
    progressColor: "stroke-pink-500",
    iconBg: "bg-pink-100",
    circleColor: "text-pink-200",
    shadowColor: "shadow-pink-100"
  },
  green: {
    bgGradient: "from-green-50 via-green-50 to-green-100",
    textColor: "text-green-600", 
    progressColor: "stroke-green-500",
    iconBg: "bg-green-100",
    circleColor: "text-green-200",
    shadowColor: "shadow-green-100"
  },
  blue: {
    bgGradient: "from-blue-50 via-blue-50 to-blue-100",
    textColor: "text-blue-600", 
    progressColor: "stroke-blue-500",
    iconBg: "bg-blue-100",
    circleColor: "text-blue-200",
    shadowColor: "shadow-blue-100"
  },
  purple: {
    bgGradient: "from-purple-50 via-purple-50 to-purple-100",
    textColor: "text-purple-600", 
    progressColor: "stroke-purple-500",
    iconBg: "bg-purple-100",
    circleColor: "text-purple-200",
    shadowColor: "shadow-purple-100"
  }
}

export function AnimatedProgressCard({ 
  title, 
  completed, 
  total, 
  color, 
  icon: Icon, 
  subtitle,
  showTrend = false,
  trendValue = 0,
  delay = 0
}: AnimatedProgressCardProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const [animatedCompleted, setAnimatedCompleted] = useState(0)
  
  const config = colorConfig[color]
  const actualPercentage = total > 0 ? Math.round((completed / total) * 100) : 0
  
  // Calculate circle progress
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      // Animate percentage
      const percentageInterval = setInterval(() => {
        setAnimatedPercentage(prev => {
          if (prev >= actualPercentage) {
            clearInterval(percentageInterval)
            return actualPercentage
          }
          return prev + Math.ceil((actualPercentage - prev) / 10)
        })
      }, 50)

      // Animate completed count
      const completedInterval = setInterval(() => {
        setAnimatedCompleted(prev => {
          if (prev >= completed) {
            clearInterval(completedInterval)
            return completed
          }
          return prev + Math.ceil((completed - prev) / 10)
        })
      }, 50)

      return () => {
        clearInterval(percentageInterval)
        clearInterval(completedInterval)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [actualPercentage, completed, delay])

  return (
    <Card className={`bg-gradient-to-br ${config.bgGradient} border-0 shadow-sm hover:shadow-lg ${config.shadowColor} transition-all duration-300 hover:scale-105`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className={`p-2 sm:p-3 rounded-xl ${config.iconBg} shadow-sm`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${config.textColor}`} />
          </div>
          
          {/* Enhanced Circular Progress Indicator */}
          <div className="relative">
            <svg className="w-14 h-14 sm:w-18 sm:h-18 transform -rotate-90" viewBox="0 0 50 50">
              {/* Background circle with subtle shadow */}
              <circle
                cx="25"
                cy="25"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className={config.circleColor}
                opacity="0.3"
              />
              {/* Progress circle with animation */}
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
                  transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            </svg>
            {/* Percentage text in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs sm:text-sm font-bold ${config.textColor}`}>
                {animatedPercentage}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {title}
            </h3>
            {showTrend && trendValue !== 0 && (
              <div className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                trendValue > 0 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {trendValue > 0 ? '+' : ''}{trendValue}%
              </div>
            )}
          </div>
          
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
              {subtitle}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600">
              Completed
            </span>
            <span className={`text-xs sm:text-sm font-semibold ${config.textColor}`}>
              {animatedCompleted.toString().padStart(2, '0')} / {total.toString().padStart(2, '0')}
            </span>
          </div>
          
          {/* Enhanced linear progress bar */}
          <div className="w-full bg-white/60 rounded-full h-2 sm:h-2.5 mt-2 sm:mt-3 shadow-inner">
            <div 
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-1000 ease-out ${config.progressColor.replace('stroke-', 'bg-')} shadow-sm`}
              style={{ 
                width: `${animatedPercentage}%`,
                background: `linear-gradient(90deg, currentColor 0%, currentColor 100%)`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}