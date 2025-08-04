import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { Navigation } from "@/components/landing/navigation"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { ScrollAnimationWrapper } from "@/components/landing/scroll-animation-wrapper"
import { StructuredData } from "@/components/landing/structured-data"
import { Metadata } from "next"
import { APP_CONFIG } from "@/lib/constants"

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - Transform Your Learning Journey`,
  description: "Experience the future of education with MindFlow's intuitive learning management system. Interactive courses, expert instructors, and personalized learning paths.",
  keywords: "learning management system, online courses, education, e-learning, interactive learning, skill development",
  authors: [{ name: APP_CONFIG.name }],
  creator: APP_CONFIG.name,
  publisher: APP_CONFIG.name,
  openGraph: {
    title: `${APP_CONFIG.name} - Transform Your Learning Journey`,
    description: "Experience the future of education with MindFlow's intuitive learning management system.",
    url: "/",
    siteName: APP_CONFIG.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_CONFIG.name} - Transform Your Learning Journey`,
    description: "Experience the future of education with MindFlow's intuitive learning management system.",
    creator: `@${APP_CONFIG.name.toLowerCase()}`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
}

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: headers(),
  })

  const isAuthenticated = !!session

  return (
    <>
      <StructuredData />
      <ScrollAnimationWrapper>
        <div className="min-h-screen bg-white">
          <Navigation isAuthenticated={isAuthenticated} />
          <HeroSection isAuthenticated={isAuthenticated} />
          <FeaturesSection />
          <TestimonialsSection />
          <CTASection isAuthenticated={isAuthenticated} />
          <Footer />
        </div>
      </ScrollAnimationWrapper>
    </>
  )
}
