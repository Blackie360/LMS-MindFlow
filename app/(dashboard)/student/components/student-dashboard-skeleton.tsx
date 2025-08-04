import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StudentDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Enhanced Progress Statistics Cards Skeleton */}
      <section>
        <Skeleton className="h-6 w-32 mb-4" />
        
        {/* Main Progress Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-18 w-18 rounded-full" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats Summary Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two-column layout for courses and upcoming activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrolled Courses Section Skeleton */}
        <section className="lg:col-span-2">
          <Skeleton className="h-6 w-28 mb-4" />
          
          {/* Summary Stats Skeleton */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Courses Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  {/* Course Thumbnail Skeleton */}
                  <Skeleton className="h-40 w-full rounded-t-lg" />

                  {/* Course Info Skeleton */}
                  <div className="p-4 space-y-3">
                    <div>
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* Progress Bar Skeleton */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>

                    {/* Last Accessed Skeleton */}
                    <Skeleton className="h-3 w-32" />

                    {/* Continue Button Skeleton */}
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Upcoming Activities Section Skeleton */}
        <section className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}