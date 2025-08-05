import { ROUTES } from "./constants"

export type UserRole = "STUDENT" | "INSTRUCTOR"

export interface NavigationItem {
  label: string
  href: string
  icon?: string
  section?: string
  isActive?: boolean
}

/**
 * Get the appropriate dashboard route for a user role
 */
export function getDashboardRoute(role: UserRole): string {
  return role === "STUDENT" ? ROUTES.STUDENT_DASHBOARD : ROUTES.ADMIN_DASHBOARD
}

/**
 * Get navigation items for a specific user role
 */
export function getNavigationItems(role: UserRole): NavigationItem[] {
  if (role === "INSTRUCTOR") {
    return [
      { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, section: "dashboard" },
      { label: "Courses", href: ROUTES.ADMIN.COURSES, section: "courses" },
      { label: "Students", href: ROUTES.ADMIN.STUDENTS, section: "students" },
      { label: "Analytics", href: ROUTES.ADMIN.ANALYTICS, section: "analytics" },
      { label: "Settings", href: ROUTES.ADMIN.SETTINGS, section: "settings" },
    ]
  }

  return [
    { label: "Dashboard", href: ROUTES.STUDENT_DASHBOARD, section: "dashboard" },
    { label: "Browse Courses", href: ROUTES.COURSES, section: "courses" },
    { label: "My Courses", href: ROUTES.MY_COURSES, section: "my-courses" },
    { label: "Settings", href: "/settings", section: "settings" },
  ]
}

/**
 * Check if a path is active based on current pathname
 */
export function isPathActive(currentPath: string, targetPath: string): boolean {
  if (currentPath === targetPath) {
    return true
  }
  
  // Check if current path starts with target path (for nested routes)
  if (targetPath !== "/" && currentPath.startsWith(targetPath + "/")) {
    return true
  }
  
  return false
}

/**
 * Get the current section based on pathname
 */
export function getCurrentSection(pathname: string, role: UserRole): string {
  const items = getNavigationItems(role)
  
  for (const item of items) {
    if (isPathActive(pathname, item.href)) {
      return item.section || "dashboard"
    }
  }
  
  return "dashboard"
}

/**
 * Generate breadcrumb items from pathname
 */
export function generateBreadcrumbs(pathname: string, role: UserRole): Array<{
  label: string
  href: string
  isActive: boolean
}> {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: Array<{ label: string; href: string; isActive: boolean }> = []

  // Add dashboard as first item
  const dashboardRoute = getDashboardRoute(role)
  const dashboardLabel = role === "STUDENT" ? "Dashboard" : "Admin Dashboard"
  
  breadcrumbs.push({
    label: dashboardLabel,
    href: dashboardRoute,
    isActive: pathname === dashboardRoute
  })

  // Build breadcrumbs from segments
  let currentPath = ""
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`
    
    // Skip the role-specific segment (student/admin)
    if ((segment === "student" || segment === "admin") && i === 0) {
      continue
    }

    const isLast = i === segments.length - 1
    const label = formatBreadcrumbLabel(segment, segments, i)
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isActive: isLast
    })
  }

  return breadcrumbs
}

/**
 * Format a URL segment into a readable breadcrumb label
 */
function formatBreadcrumbLabel(segment: string, segments: string[], index: number): string {
  const formatMap: Record<string, string> = {
    "courses": "Courses",
    "students": "Students",
    "analytics": "Analytics", 
    "settings": "Settings",
    "my-courses": "My Courses",
    "create": "Create",
    "edit": "Edit",
    "view": "View",
    "profile": "Profile"
  }

  if (formatMap[segment]) {
    return formatMap[segment]
  }

  // Handle UUID-like segments
  if (segment.match(/^[0-9a-f-]{36}$/)) {
    const prevSegment = segments[index - 1]
    if (prevSegment === "courses") return "Course Details"
    if (prevSegment === "students") return "Student Profile"
    return "Details"
  }

  // Default formatting
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
}

/**
 * Navigate with proper history management
 */
export function navigateWithHistory(
  router: any,
  href: string,
  options?: {
    replace?: boolean
    scroll?: boolean
  }
) {
  if (options?.replace) {
    router.replace(href, { scroll: options.scroll ?? true })
  } else {
    router.push(href, { scroll: options.scroll ?? true })
  }
}

/**
 * Get quick navigation shortcuts for a role
 */
export function getQuickNavShortcuts(role: UserRole): Array<{
  key: string
  label: string
  href: string
  description: string
}> {
  if (role === "INSTRUCTOR") {
    return [
      {
        key: "d",
        label: "Dashboard",
        href: ROUTES.ADMIN.DASHBOARD,
        description: "Go to admin dashboard"
      },
      {
        key: "c",
        label: "Courses",
        href: ROUTES.ADMIN.COURSES,
        description: "Manage courses"
      },
      {
        key: "s",
        label: "Students",
        href: ROUTES.ADMIN.STUDENTS,
        description: "View students"
      },
      {
        key: "a",
        label: "Analytics",
        href: ROUTES.ADMIN.ANALYTICS,
        description: "View analytics"
      }
    ]
  }

  return [
    {
      key: "d",
      label: "Dashboard", 
      href: ROUTES.STUDENT_DASHBOARD,
      description: "Go to dashboard"
    },
    {
      key: "c",
      label: "Courses",
      href: ROUTES.COURSES,
      description: "Browse courses"
    },
    {
      key: "m",
      label: "My Courses",
      href: ROUTES.MY_COURSES,
      description: "View my courses"
    }
  ]
}