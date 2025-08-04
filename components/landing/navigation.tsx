"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { APP_CONFIG } from "@/lib/constants"
import { Menu, X } from "lucide-react"
import { useState } from "react"

interface NavigationProps {
  isAuthenticated?: boolean
}

export function Navigation({ isAuthenticated = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold brand-font">
              {APP_CONFIG.name}
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Features
            </a>
            <a 
              href="#testimonials" 
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Testimonials
            </a>
            <a 
              href="#cta" 
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Get Started
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/auth">Log In</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex">
                  <Link href="/auth">Sign Up</Link>
                </Button>
              </>
            )}
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              <a 
                href="#features" 
                className="block text-gray-600 hover:text-gray-900 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                  setIsMobileMenuOpen(false)
                }}
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                className="block text-gray-600 hover:text-gray-900 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })
                  setIsMobileMenuOpen(false)
                }}
              >
                Testimonials
              </a>
              <a 
                href="#cta" 
                className="block text-gray-600 hover:text-gray-900 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })
                  setIsMobileMenuOpen(false)
                }}
              >
                Get Started
              </a>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {isAuthenticated ? (
                  <Button asChild className="w-full">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full">
                      <Link href="/auth">Log In</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/auth">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}