"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoModal } from "@/components/ui/demo-modal";
import { useState } from "react";
import { 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Check, 
  Star,
  Users,
  BookOpen,
  BarChart3,
  Zap,
  Shield,
  Headphones,
  Globe,
  Mail,
  Twitter,
  Linkedin,
  Github
} from "lucide-react";

export default function Home() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand rounded flex items-center justify-center">
            <span className="text-brand-foreground font-bold text-lg">M</span>
          </div>
          <span className="text-foreground text-xl font-semibold">MindFlow</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-foreground hover:text-brand transition-colors">Features</a>
          <a href="#pricing" className="text-foreground hover:text-brand transition-colors">Pricing</a>
          <a href="#testimonials" className="text-foreground hover:text-brand transition-colors">Testimonials</a>
          <a href="#contact" className="text-foreground hover:text-brand transition-colors">Contact</a>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-foreground hover:bg-accent" asChild>
            <a href="/auth/signin">Sign In</a>
          </Button>
          <Button className="bg-brand hover:bg-brand/90 text-brand-foreground" asChild>
            <a href="/auth/signup">Get Started</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-brand/20 rounded-3xl mx-4"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-brand/20 text-brand border-brand/30">
            🚀 Now with AI-powered insights
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">Transform Learning</span>
            <br />
            <span className="text-brand">with Simple LMS</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Effortlessly manage learning progress, enhance engagement, and drive student success with our intuitive learning management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4" asChild>
              <a href="/auth/signup">Start Free Trial</a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-foreground border-border hover:bg-accent text-lg px-8 py-4"
              onClick={() => setIsDemoModalOpen(true)}
            >
              Watch Demo
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-muted-foreground text-sm">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-success" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-success" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="px-6 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            See MindFlow in Action
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Watch how easy it is to create courses, manage students, and track progress with our intuitive platform.
          </p>
          <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-brand/20 rounded-xl flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p className="text-muted-foreground">Demo video will be embedded here</p>
                <p className="text-sm text-muted-foreground mt-2">Click to play the full demo</p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setIsDemoModalOpen(true)}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play Full Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make learning management simple, engaging, and effective.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Easily manage student enrollments, track progress, and maintain comprehensive records all in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-foreground">Course Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create engaging courses with multimedia content, quizzes, and interactive elements to boost learning outcomes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-foreground">Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get detailed insights into student performance, engagement metrics, and learning analytics to optimize your courses.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-brand/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-brand" />
                </div>
                <CardTitle className="text-foreground">AI-Powered Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Leverage artificial intelligence to personalize learning paths and provide intelligent recommendations for each student.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-foreground">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bank-level security with data encryption, role-based access control, and compliance with industry standards.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-foreground">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Round-the-clock customer support with dedicated success managers to ensure your success with MindFlow.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="px-6 py-20">
        <Card className="bg-card/50 border-border/50 max-w-6xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
                <span className="text-brand-foreground font-bold text-sm">M</span>
              </div>
              <span className="text-foreground text-lg font-semibold">MindFlow Dashboard</span>
            </div>
            <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
              <Settings className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">1,247</span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Total Students</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">89</span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2%
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Active Courses</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">94.2%</span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.1%
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Completion Rate</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">$45.2K</span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +18.7%
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Monthly Revenue</p>
              </CardContent>
            </Card>
          </CardContent>

          <div className="px-6 pb-6">
            <div className="bg-gradient-to-r from-brand to-destructive rounded-lg p-6 text-center">
              <span className="text-brand-foreground font-semibold text-2xl">$45,200</span>
              <p className="text-brand-foreground/80 text-sm mt-1">Revenue this month</p>
              <Button className="mt-3 bg-background text-foreground hover:bg-background/90">
                View Full Analytics
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Loved by educators worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about their experience with MindFlow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "MindFlow has completely transformed how we manage our online courses. The analytics are incredible and our students love the interface."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">S</span>
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">Sarah Johnson</p>
                    <p className="text-muted-foreground text-sm">Director of Education, TechAcademy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The AI-powered insights have helped us improve our course completion rates by 40%. It's like having a learning expert on our team."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                    <span className="text-success-foreground font-semibold">M</span>
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">Michael Chen</p>
                    <p className="text-muted-foreground text-sm">CEO, LearnFlow Inc</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Setting up our courses was incredibly easy. The platform is intuitive and our students find it very engaging. Highly recommended!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-accent-foreground font-semibold">E</span>
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">Emma Rodriguez</p>
                    <p className="text-muted-foreground text-sm">Lead Instructor, SkillCraft</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for your organization. All plans include our core features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="text-foreground">Starter</CardTitle>
                <div className="text-3xl font-bold text-foreground">$29<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">Perfect for small teams and individual educators</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Up to 100 students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">5 courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Basic analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Email support</span>
                  </div>
                </div>
                <Button className="w-full bg-brand hover:bg-brand/90 text-brand-foreground">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 border-brand/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-brand text-brand-foreground">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-foreground">Professional</CardTitle>
                <div className="text-3xl font-bold text-foreground">$79<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">Ideal for growing educational institutions</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Up to 1,000 students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Unlimited courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Advanced analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">AI-powered insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Priority support</span>
                  </div>
                </div>
                <Button className="w-full bg-brand hover:bg-brand/90 text-brand-foreground">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="text-foreground">Enterprise</CardTitle>
                <div className="text-3xl font-bold text-foreground">Custom</div>
                <p className="text-muted-foreground">For large organizations with specific needs</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Unlimited students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Unlimited courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Custom integrations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Dedicated success manager</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">SLA guarantee</span>
                  </div>
                </div>
                <Button className="w-full bg-background text-foreground hover:bg-background/90">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-primary to-brand border-0">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-primary-foreground mb-4">
                Ready to transform your learning?
              </h2>
              <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Join thousands of educators who are already using MindFlow to create engaging learning experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-4">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 text-lg px-8 py-4"
                  onClick={() => setIsDemoModalOpen(true)}
                >
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="px-6 py-16 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-brand rounded flex items-center justify-center">
                  <span className="text-brand-foreground font-bold text-lg">M</span>
                </div>
                <span className="text-foreground text-xl font-semibold">MindFlow</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Transforming education through innovative learning management solutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-foreground font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-foreground font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-foreground font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 MindFlow. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
