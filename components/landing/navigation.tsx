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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const navbarHeight = 64 // 16 * 4 = 64px (h-16)
      const elementPosition = element.offsetTop - navbarHeight
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-white">{APP_CONFIG.name}</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('features')
              }}
            >
              Products
            </a>
            <a 
              href="#testimonials" 
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('testimonials')
              }}
            >
              Features
            </a>
            <a 
              href="#cta" 
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('cta')
              }}
            >
              Pricing
            </a>
            <a 
              href="#testimonials" 
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('testimonials')
              }}
            >
              Resources
            </a>
            <a 
              href="#testimonials" 
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('testimonials')
              }}
            >
              Blog
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button asChild className="hidden sm:inline-flex bg-orange-500 hover:bg-orange-600 text-white">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild className="hidden sm:inline-flex bg-orange-500 hover:bg-orange-600 text-white border-0">
                <Link href="/auth">Log In</Link>
              </Button>
            )}
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white"
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
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-4 space-y-4">
              <a 
                href="#features" 
                className="block text-gray-300 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('features')
                  setIsMobileMenuOpen(false)
                }}
              >
                Products
              </a>
              <a 
                href="#testimonials" 
                className="block text-gray-300 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('testimonials')
                  setIsMobileMenuOpen(false)
                }}
              >
                Features
              </a>
              <a 
                href="#cta" 
                className="block text-gray-300 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('cta')
                  setIsMobileMenuOpen(false)
                }}
              >
                Pricing
              </a>
              <div className="pt-4 border-t border-gray-700 space-y-2">
                {isAuthenticated ? (
                  <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                    <Link href="/auth">Log In</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}