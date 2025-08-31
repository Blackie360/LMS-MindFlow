"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Play, Pause, RotateCcw } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "Dashboard Overview",
      description: "Get a bird's eye view of your learning platform with key metrics and insights.",
      image: "📊",
      duration: 3000,
    },
    {
      title: "Course Creation",
      description: "Create engaging courses with our intuitive drag-and-drop interface.",
      image: "📚",
      duration: 4000,
    },
    {
      title: "Student Management",
      description: "Easily manage student enrollments, track progress, and communicate.",
      image: "👥",
      duration: 3500,
    },
    {
      title: "Analytics & Reports",
      description: "Dive deep into learning analytics and performance metrics.",
      image: "📈",
      duration: 3000,
    },
  ];

  const handlePlay = () => {
    setIsPlaying(true);
    // Auto-advance through demo steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= demoSteps.length - 1) {
          clearInterval(interval);
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, demoSteps[currentStep].duration);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle className="text-2xl">MindFlow Demo</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{demoSteps[currentStep].image}</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {demoSteps[currentStep].title}
            </h3>
            <p className="text-muted-foreground text-lg">
              {demoSteps[currentStep].description}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4 mb-6">
            {!isPlaying ? (
              <Button onClick={handlePlay} className="bg-primary hover:bg-primary/90">
                <Play className="h-4 w-4 mr-2" />
                Play Demo
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex justify-center space-x-2">
            {demoSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "bg-primary w-8"
                    : index < currentStep
                    ? "bg-primary/50 w-6"
                    : "bg-muted w-4"
                }`}
              />
            ))}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {demoSteps.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
