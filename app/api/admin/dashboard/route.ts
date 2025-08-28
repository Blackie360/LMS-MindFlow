import { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { getAdminDashboardData } from "@/app/(dashboard)/admin/lib/admin-data"
import { 
  withApiErrorHandling, 
  requireAuth, 
  requireRole, 
  createSuccessResponse,
  ApiErrors,
  withDatabaseErrorHandling
} from "@/lib/api-error-handler"

export const dynamic = 'force-dynamic'

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  // Get and validate user
  const user = await getCurrentUser()
  requireAuth(user)
  requireRole(user, "INSTRUCTOR")

  // Validate request parameters
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    throw new Error("User ID is required")
  }

  // Ensure user can only access their own data
  if (userId !== user.id) {
    throw ApiErrors.FORBIDDEN
  }

  // Fetch dashboard data with database error handling
  const dashboardData = await withDatabaseErrorHandling(
    () => getAdminDashboardData(userId),
    "fetching admin dashboard data"
  )
  
  return createSuccessResponse(dashboardData, "Admin dashboard data retrieved successfully")
})