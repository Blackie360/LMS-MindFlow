"use client"

import { Star, Quote } from "lucide-react"

interface Testimonial {
  name: string
  role: string
  content: string
  avatar: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Marketing Student",
    content: "MindFlow transformed my learning experience with its intuitive interface and engaging content. The interactive courses kept me motivated throughout my journey.",
    avatar: "SJ",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Software Developer",
    content: "The progress tracking feature helped me stay on track with my goals. The collaborative tools made learning with peers incredibly effective.",
    avatar: "MC",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Business Analyst",
    content: "I love how flexible the platform is. Being able to learn at my own pace while still having access to expert instructors made all the difference.",
    avatar: "ER",
    rating: 5
  },
  {
    name: "David Thompson",
    role: "Graphic Designer",
    content: "The certification program gave me the credentials I needed to advance my career. The quality of instruction is outstanding.",
    avatar: "DT",
    rating: 5
  },
  {
    name: "Lisa Park",
    role: "Project Manager",
    content: "MindFlow's collaborative features allowed me to connect with like-minded professionals. The networking opportunities have been invaluable.",
    avatar: "LP",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "Data Scientist",
    content: "The analytics and insights provided by the platform helped me understand my learning patterns and optimize my study time effectively.",
    avatar: "JW",
    rating: 5
  }
]

interface TestimonialCardProps {
  testimonial: Testimonial
  index: number
}

function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <div 
      className="bg-gray-800/50 p-6 rounded-xl shadow-sm border border-gray-700/50 hover:shadow-lg transition-all duration-300 fade-in-up"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Quote icon */}
      <div className="flex items-center justify-between mb-4">
        <Quote className="h-8 w-8 text-orange-500 opacity-50" />
        <div className="flex items-center space-x-1">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-300 mb-6 leading-relaxed">
        "{testimonial.content}"
      </p>

      {/* Author */}
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
          {testimonial.avatar}
        </div>
        <div>
          <div className="font-semibold text-white">{testimonial.name}</div>
          <div className="text-sm text-gray-400">{testimonial.role}</div>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-white mb-4 fade-in-up">
            What Our <span className="gradient-text">Learners</span> Say
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed fade-in-up">
            Join thousands of successful learners who have transformed their careers 
            and achieved their goals with MindFlow.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-orange-100">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-orange-100">Courses Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-orange-100">Career Advancement</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-orange-100">Expert Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}