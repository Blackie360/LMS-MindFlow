"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";

function SignInPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "OAuthSignin":
        return "There was a problem signing in with the OAuth provider. Please try again or use email/password.";
      case "OAuthCallback":
        return "There was an error during the OAuth callback. Please try again.";
      case "OAuthCreateAccount":
        return "Could not create account with OAuth provider. Please try again.";
      case "EmailCreateAccount":
        return "Could not create account with email. Please try again.";
      case "Callback":
        return "There was an error during sign in. Please try again.";
      case "OAuthAccountNotLinked":
        return "This account is already linked to another sign-in method. Please sign in using your original method.";
      case "EmailSignin":
        return "There was an error sending the sign-in email. Please try again.";
      case "CredentialsSignin":
        return "Invalid credentials. Please check your email and password.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      case "Default":
        return "An error occurred during sign in. Please try again.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-800">
              {getErrorMessage(error)}
            </div>
          </div>
        )}

        <SignInForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-600">
              Loading...
            </p>
          </div>
        </div>
      </div>
    }>
      <SignInPageContent />
    </Suspense>
  );
}
