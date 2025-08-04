"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

interface HeroSectionProps {
  isAuthenticated?: boolean
}

export function HeroSection({ isAuthenticated = false }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden pt-16">
      {/* Background decoration - warm orange gradient orb like in the image */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/30 via-amber-500/20 to-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-amber-400/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-amber-400/15 to-orange-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="hero-title font-poppins font-extrabold text-white mb-6 fade-in-up">
            Transform Learning<br />
            with <span className="text-orange-400">Simple LMS</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed fade-in-up">
            Effortlessly manage learning progress, enhancing<br />
            engagement and student success.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 fade-in-up">
            {isAuthenticated ? (
              <Button size="lg" className="text-lg px-8 py-4 h-auto" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-4 h-auto group bg-orange-500 hover:bg-orange-600 text-white border-0" asChild>
                  <Link href="/auth">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 h-auto group"
                  asChild
                >
                  <Link href="#demo">
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Dashboard Preview - inspired by the image */}
          <div className="mt-16 fade-in-up">
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <span className="text-white font-semibold">MindFlow Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white mb-1">15,799</div>
                    <div className="text-sm text-gray-400">Total Students</div>
                    <div className="text-xs text-green-400 mt-1">↗ 10.04%</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white mb-1">13,290</div>
                    <div className="text-sm text-gray-400">Total Enrolled</div>
                    <div className="text-xs text-red-400 mt-1">↘ 4.06%</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white mb-1">11,000</div>
                    <div className="text-sm text-gray-400">Total Subscription</div>
                    <div className="text-xs text-red-400 mt-1">↘ 1.07%</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white mb-1">$29,390</div>
                    <div className="text-sm text-gray-400">Total Revenue</div>
                    <div className="text-xs text-green-400 mt-1">↗ 16.00%</div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-32 h-20 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg relative">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-xs text-white bg-gray-800 px-2 py-1 rounded">
                      $3.5K
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-500 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}