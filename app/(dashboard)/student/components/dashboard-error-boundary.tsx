"use client"

import { Component, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Dashboard error boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-red-700 text-center mb-6 max-w-md">
              We encountered an error while loading your dashboard. This has been logged and we're working to fix it.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-100 transition-colors"
              >
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 w-full max-w-2xl">
                <summary className="cursor-pointer text-sm text-red-600 font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-red-100 rounded-md text-xs text-red-800 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}