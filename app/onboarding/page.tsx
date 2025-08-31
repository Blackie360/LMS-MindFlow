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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground text-lg">Setting up your workspace...</div>
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">M</span>
            </div>
            <span className="text-foreground text-3xl font-bold">MindFlow</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to MindFlow, {session.user.name || session.user.email}!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
                    ? "bg-primary border-primary text-primary-foreground" 
                    : "bg-transparent border-border text-muted-foreground"
                }`}>
                  {step > stepNumber ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step > stepNumber ? "bg-primary" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-foreground">Create Your Organization</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Set up your school, academy, or learning institution
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-foreground font-semibold mb-2">Manage Members</h3>
                  <p className="text-muted-foreground text-sm">Invite instructors, students, and staff</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-foreground font-semibold mb-2">Create Courses</h3>
                  <p className="text-muted-foreground text-sm">Build engaging learning experiences</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-foreground font-semibold mb-2">AI Insights</h3>
                  <p className="text-muted-foreground text-sm">Get intelligent learning analytics</p>
                </div>
              </div>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4"
                onClick={() => setStep(2)}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-foreground">Set Up Your School</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Configure your organization details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showCreateSchool ? (
                <div className="text-center py-8">
                  <h3 className="text-xl font-medium text-foreground mb-4">
                    Ready to create your school?
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    This will set up your organization with teams, member management, and course creation capabilities.
                  </p>
                  <Button 
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-foreground">All Set!</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Your organization has been created successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="py-8">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  Welcome to MindFlow!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Redirecting you to your dashboard...
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
