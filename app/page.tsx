import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-white text-xl font-semibold">MindFlow</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-white hover:text-orange-400 transition-colors">Features</a>
          <a href="#pricing" className="text-white hover:text-orange-400 transition-colors">Pricing</a>
          <a href="#testimonials" className="text-white hover:text-orange-400 transition-colors">Testimonials</a>
          <a href="#contact" className="text-white hover:text-orange-400 transition-colors">Contact</a>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
            <a href="/auth/signin">Sign In</a>
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
            <a href="/auth/signup">Get Started</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl mx-4"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
            🚀 Now with AI-powered insights
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Transform Learning</span>
            <br />
            <span className="text-orange-500">with Simple LMS</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Effortlessly manage learning progress, enhance engagement, and drive student success with our intuitive learning management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 text-lg px-8 py-4">
              Watch Demo
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-white/60 text-sm">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Powerful features designed to make learning management simple, engaging, and effective.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  Easily manage student enrollments, track progress, and maintain comprehensive records all in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Course Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  Create engaging courses with multimedia content, quizzes, and interactive elements to boost learning outcomes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  Get detailed insights into student performance, engagement metrics, and learning analytics to optimize your courses.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-400" />
                </div>
                <CardTitle className="text-white">AI-Powered Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  Leverage artificial intelligence to personalize learning paths and provide intelligent recommendations for each student.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-400" />
                </div>
                <CardTitle className="text-white">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  Bank-level security with data encryption, role-based access control, and compliance with industry standards.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-indigo-400" />
                </div>
                <CardTitle className="text-white">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
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
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-white text-lg font-semibold">MindFlow Dashboard</span>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Settings className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-white">1,247</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </Badge>
                </div>
                <p className="text-white/70 text-sm">Total Students</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-white">89</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2%
                  </Badge>
                </div>
                <p className="text-white/70 text-sm">Active Courses</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-white">94.2%</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.1%
                  </Badge>
                </div>
                <p className="text-white/70 text-sm">Completion Rate</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-white">$45.2K</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +18.7%
                  </Badge>
                </div>
                <p className="text-white/70 text-sm">Monthly Revenue</p>
              </CardContent>
            </Card>
          </CardContent>

          <div className="px-6 pb-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-center">
              <span className="text-white font-semibold text-2xl">$45,200</span>
              <p className="text-white/80 text-sm mt-1">Revenue this month</p>
              <Button className="mt-3 bg-white text-orange-600 hover:bg-white/90">
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
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by educators worldwide
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              See what our customers have to say about their experience with MindFlow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/80 mb-4">
                  "MindFlow has completely transformed how we manage our online courses. The analytics are incredible and our students love the interface."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">S</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Sarah Johnson</p>
                    <p className="text-white/60 text-sm">Director of Education, TechAcademy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/80 mb-4">
                  "The AI-powered insights have helped us improve our course completion rates by 40%. It's like having a learning expert on our team."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">M</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Michael Chen</p>
                    <p className="text-white/60 text-sm">CEO, LearnFlow Inc</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/80 mb-4">
                  "Setting up our courses was incredibly easy. The platform is intuitive and our students find it very engaging. Highly recommended!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">E</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Emma Rodriguez</p>
                    <p className="text-white/60 text-sm">Lead Instructor, SkillCraft</p>
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
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Choose the plan that's right for your organization. All plans include our core features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Starter</CardTitle>
                <div className="text-3xl font-bold text-white">$29<span className="text-lg text-white/60">/month</span></div>
                <p className="text-white/60">Perfect for small teams and individual educators</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">Up to 100 students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">5 courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">Basic analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">Email support</span>
                  </div>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 border-orange-500/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-white">Professional</CardTitle>
                <div className="text-3xl font-bold text-white">$79<span className="text-lg text-white/60">/month</span></div>
                <p className="text-white/60">Ideal for growing educational institutions</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">Up to 1,000 students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">Unlimited courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">Advanced analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">AI-powered insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">Priority support</span>
                  </div>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Enterprise</CardTitle>
                <div className="text-3xl font-bold text-white">Custom</div>
                <p className="text-white/60">For large organizations with specific needs</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">Unlimited students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">Unlimited courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">Custom integrations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">Dedicated success manager</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-white/80">SLA guarantee</span>
                  </div>
                </div>
                <Button className="w-full bg-white text-gray-900 hover:bg-white/90">
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
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to transform your learning?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of educators who are already using MindFlow to create engaging learning experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 text-lg px-8 py-4">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 text-lg px-8 py-4">
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
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-white text-xl font-semibold">MindFlow</span>
              </div>
              <p className="text-white/70 mb-4">
                Transforming education through innovative learning management solutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2024 MindFlow. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
