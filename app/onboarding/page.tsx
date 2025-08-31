"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { CreateSchoolForm } from "@/components/organization/CreateSchoolForm";
import { 
  Building2, 
  Users, 
  BookOpen, 
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();
  const [step, setStep] = useState(1);
  const [showCreateSchool, setShowCreateSchool] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
        <div className="text-white text-lg">Setting up your workspace...</div>
      </div>
    );
  }

  if (error || !session) {
    return null;
  }

  const handleOrganizationCreated = () => {
    // Redirect immediately to dashboard after successful organization creation
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <span className="text-white text-3xl font-bold">MindFlow</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to MindFlow, {session.user.name || session.user.email}!
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Let's set up your learning organization and get you started with creating amazing educational experiences.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= stepNumber 
                    ? "bg-orange-500 border-orange-500 text-white" 
                    : "bg-transparent border-white/30 text-white/50"
                }`}>
                  {step > stepNumber ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step > stepNumber ? "bg-orange-500" : "bg-white/30"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-orange-400" />
              </div>
              <CardTitle className="text-2xl text-white">Create Your Organization</CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Set up your school, academy, or learning institution
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Manage Members</h3>
                  <p className="text-white/70 text-sm">Invite instructors, students, and staff</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Create Courses</h3>
                  <p className="text-white/70 text-sm">Build engaging learning experiences</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">AI Insights</h3>
                  <p className="text-white/70 text-sm">Get intelligent learning analytics</p>
                </div>
              </div>
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4"
                onClick={() => setStep(2)}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-white">Set Up Your School</CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Configure your organization details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showCreateSchool ? (
                <div className="text-center py-8">
                  <h3 className="text-xl font-medium text-white mb-4">
                    Ready to create your school?
                  </h3>
                  <p className="text-white/80 mb-6 max-w-md mx-auto">
                    This will set up your organization with teams, member management, and course creation capabilities.
                  </p>
                  <Button 
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => setShowCreateSchool(true)}
                  >
                    Create New School
                  </Button>
                </div>
              ) : (
                <CreateSchoolForm onSuccess={handleOrganizationCreated} />
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-white">All Set!</CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Your organization has been created successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  Welcome to MindFlow!
                </h3>
                <p className="text-white/80 mb-4">
                  Redirecting you to your dashboard...
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
