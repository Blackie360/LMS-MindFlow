"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

interface CTASectionProps {
  isAuthenticated?: boolean
}

export function CTASection({ isAuthenticated = false }: CTASectionProps) {
  return (
    <section id="cta" className="py-20 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Icon */}
          <div className="flex justify-center mb-6 fade-in-up">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 fade-in-up">
            Ready to Transform Your Learning Journey?
          </h2>

          {/* Description */}
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed fade-in-up">
            Join thousands of learners who have already discovered the power of MindFlow. 
            Start your journey today and unlock your full potential.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up">
            {isAuthenticated ? (
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 h-auto bg-white text-orange-600 hover:bg-gray-100 group"
                asChild
              >
                <Link href="/dashboard">
                  Continue Learning
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-4 h-auto bg-white text-orange-600 hover:bg-gray-100 group"
                  asChild
                >
                  <Link href="/auth">
                    Start Learning Today
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 h-auto border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                  asChild
                >
                  <Link href="/auth">
                    Try Free Demo
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-12 fade-in-up">
            <p className="text-white/70 text-sm mb-4">Trusted by learners worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-white font-semibold">10K+ Students</div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="text-white font-semibold">500+ Courses</div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="text-white font-semibold">98% Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}