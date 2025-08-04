"use client"

import { BookOpen, Users, BarChart, Clock, Award, MessageSquare } from "lucide-react"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "Interactive Courses",
    description: "Engage with multimedia content, quizzes, and hands-on exercises designed to enhance your learning experience."
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Collaborative Learning",
    description: "Connect with peers and instructors through discussion forums, group projects, and real-time collaboration tools."
  },
  {
    icon: <BarChart className="h-8 w-8" />,
    title: "Progress Tracking",
    description: "Monitor your learning journey with detailed analytics, completion rates, and personalized performance insights."
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Flexible Scheduling",
    description: "Learn at your own pace with 24/7 access to course materials and flexible deadline management."
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Certifications",
    description: "Earn industry-recognized certificates and badges to showcase your achievements and advance your career."
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: "Expert Support",
    description: "Get help when you need it with dedicated instructor support, peer mentoring, and comprehensive resources."
  }
]

interface FeatureCardProps {
  feature: Feature
  index: number
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  return (
    <div 
      className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300">
        <div className="text-white">
          {feature.icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
        {feature.title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {feature.description}
      </p>
    </div>
  )
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 fade-in-up">
            Everything You Need to{" "}
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed fade-in-up">
            Discover powerful features designed to enhance your learning experience 
            and help you achieve your educational goals faster than ever before.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 fade-in-up">
          <p className="text-lg text-gray-600 mb-6">
            Ready to experience the future of learning?
          </p>
          <button className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
            Start Your Journey
          </button>
        </div>
      </div>
    </section>
  )
}