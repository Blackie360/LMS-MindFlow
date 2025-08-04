"use client"

import { useEffect, useState } from "react"

interface ProgressIndicatorProps {
  percentage: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'orange' | 'pink' | 'green' | 'blue' | 'purple'
  showPercentage?: boolean
  animated?: boolean
  strokeWidth?: number
  className?: string
}

const sizeConfig = {
  sm: { width: 40, height: 40, radius: 16, fontSize: 'text-xs' },
  md: { width: 50, height: 50, radius: 20, fontSize: 'text-sm' },
  lg: { width: 60, height: 60, radius: 24, fontSize: 'text-sm' },
  xl: { width: 80, height: 80, radius: 32, fontSize: 'text-base' }
}

const colorConfig = {
  orange: { progress: 'stroke-orange-500', background: 'stroke-orange-200' },
  pink: { progress: 'stroke-pink-500', background: 'stroke-pink-200' },
  green: { progress: 'stroke-green-500', background: 'stroke-green-200' },
  blue: { progress: 'stroke-blue-500', background: 'stroke-blue-200' },
  purple: { progress: 'stroke-purple-500', background: 'stroke-purple-200' }
}

export function ProgressIndicator({
  percentage,
  size = 'md',
  color = 'blue',
  showPercentage = true,
  animated = true,
  strokeWidth = 3,
  className = ''
}: ProgressIndicatorProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(animated ? 0 : percentage)
  
  const sizeSettings = sizeConfig[size]
  const colorSettings = colorConfig[color]
  
  const circumference = 2 * Math.PI * sizeSettings.radius
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference

  useEffect(() => {
    if (!animated) return

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedPercentage(prev => {
          if (prev >= percentage) {
            clearInterval(interval)
            return percentage
          }
          return prev + Math.ceil((percentage - prev) / 20)
        })
      }, 30)

      return () => clearInterval(interval)
    }, 100)

    return () => clearTimeout(timer)
  }, [percentage, animated])

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg 
        width={sizeSettings.width} 
        height={sizeSettings.height} 
        className="transform -rotate-90"
        viewBox={`0 0 ${sizeSettings.width} ${sizeSettings.height}`}
      >
        {/* Background circle */}
        <circle
          cx={sizeSettings.width / 2}
          cy={sizeSettings.height / 2}
          r={sizeSettings.radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={colorSettings.background}
          opacity="0.3"
        />
        {/* Progress circle */}
        <circle
          cx={sizeSettings.width / 2}
          cy={sizeSettings.height / 2}
          r={sizeSettings.radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={colorSettings.progress}
          style={{
            transition: animated ? 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        />
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-semibold ${sizeSettings.fontSize} ${colorSettings.progress.replace('stroke-', 'text-')}`}>
            {Math.round(animatedPercentage)}%
          </span>
        </div>
      )}
    </div>
  )
}