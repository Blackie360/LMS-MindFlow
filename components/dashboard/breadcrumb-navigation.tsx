"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Fragment } from "react"
import { generateBreadcrumbs, type UserRole } from "@/lib/navigation-utils"

interface BreadcrumbNavigationProps {
  userRole: UserRole
}

export function BreadcrumbNavigation({ userRole }: BreadcrumbNavigationProps) {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname, userRole)

  // Don't show breadcrumbs if we're just on the main dashboard
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {breadcrumbs.map((item, index) => (
          <Fragment key={item.href}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            )}
            <li>
              {item.isActive ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}