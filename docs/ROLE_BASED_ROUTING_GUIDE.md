# Role-Based Routing Guide

## Overview

MindFlow implements a comprehensive role-based routing system that automatically directs users to their appropriate dashboards based on their roles within the organization. This system ensures that users only see relevant features and data for their specific role.

## How Role-Based Routing Works

### 1. Authentication Flow

When a user signs in, the system follows this flow:

1. **User Signs In** → Redirected to `/dashboard`
2. **Dashboard Layout Detects Role** → Automatically redirects to appropriate dashboard
3. **User Sees Role-Specific Interface** → Based on their effective role

### 2. Role Detection Logic

The system determines a user's effective role through multiple sources:

```typescript
// Role Priority (highest to lowest):
1. Organization Creator (Super Admin)
2. Organization Member Role (from OrganizationMember table)
3. User Role (from User table)
4. Default: Student
```

### 3. Effective Role Calculation

```typescript
let effectiveRole = organizationRole || userRole.toLowerCase();

// If user is organization creator, they're a super user
if (userOrganizations.some(org => org.createdBy === session.user.id)) {
  effectiveRole = "super_admin";
}
```

## User Roles and Dashboards

### 1. Super User (Admin/Super Admin)
- **Who**: Organization creators and administrators
- **Dashboard**: `/dashboard` (main dashboard)
- **Features**:
  - Create and manage organizations
  - Invite instructors and students
  - Manage all organization settings
  - Access to all dashboard features
  - Full system administration

### 2. Instructor (Lead Instructor/Instructor)
- **Who**: Teaching staff and course creators
- **Dashboard**: `/dashboard/instructor`
- **Features**:
  - Create and manage courses
  - Enroll students in courses
  - Track student progress
  - Access to course management features
  - Student enrollment management

### 3. Student
- **Who**: Learners and course participants
- **Dashboard**: `/dashboard/student`
- **Features**:
  - View enrolled courses
  - Track learning progress
  - Access course content
  - View achievements and badges
  - Learning analytics

## Routing Implementation

### Dashboard Layout (`app/dashboard/layout.tsx`)

The dashboard layout is responsible for role-based routing:

```typescript
// Role detection and routing logic
useEffect(() => {
  if (!isLoading && !isPending && session) {
    let effectiveRole = organizationRole || userRole.toLowerCase();
    
    // Organization creator = super admin
    if (userOrganizations.some(org => org.createdBy === session.user.id)) {
      effectiveRole = "super_admin";
    }
    
    // Route based on effective role
    if (effectiveRole === "super_admin" || effectiveRole === "admin") {
      setShouldRedirect(null); // Stay on main dashboard
    } else if (effectiveRole === "instructor" || effectiveRole === "lead_instructor") {
      setShouldRedirect("instructor");
    } else if (effectiveRole === "student") {
      setShouldRedirect("student");
    } else {
      setShouldRedirect("student"); // Default fallback
    }
  }
}, [isLoading, isPending, session, organizationRole, userRole, userOrganizations]);

// Handle actual navigation
useEffect(() => {
  if (shouldRedirect === "instructor") {
    router.push("/dashboard/instructor");
  } else if (shouldRedirect === "student") {
    router.push("/dashboard/student");
  }
}, [shouldRedirect, router]);
```

### Sign In Flow (`components/auth/SignInForm.tsx`)

The sign-in form redirects all users to `/dashboard`, letting the dashboard layout handle role-based routing:

```typescript
const { data, error } = await authClient.signIn.email({
  email,
  password,
  callbackURL: "/dashboard", // Always redirect to main dashboard
}, {
  onSuccess: () => {
    router.push("/dashboard"); // Dashboard layout will handle role routing
  },
});
```

## Special Cases

### 1. Invitation Acceptance

When users accept invitations, they are redirected directly to their role-specific dashboard:

```typescript
// In invitation acceptance API
switch (updatedUser.role) {
  case 'INSTRUCTOR':
    redirectUrl = `/dashboard/instructor?welcome=true&org=${organization.slug}`;
    break;
  case 'STUDENT':
    redirectUrl = `/dashboard/student?welcome=true&org=${organization.slug}`;
    break;
  case 'ADMIN':
  case 'SUPER_ADMIN':
    redirectUrl = `/dashboard?welcome=true&org=${organization.slug}`;
    break;
  default:
    redirectUrl = `/dashboard?welcome=true&org=${organization.slug}`;
}
```

### 2. Sign Up Flow

New users follow this path:
1. Sign up → `/onboarding`
2. Complete onboarding → `/dashboard`
3. Dashboard layout detects role → appropriate dashboard

## Database Schema

### User Roles (User table)
```prisma
model User {
  id    String @id @default(cuid())
  role  Role   @default(STUDENT)
  // ... other fields
}

enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
  SUPER_ADMIN
}
```

### Organization Roles (OrganizationMember table)
```prisma
model OrganizationMember {
  id             String @id @default(cuid())
  organizationId String
  userId         String
  role           String // admin, leadInstructor, instructor, student
  // ... other fields
}
```

## Testing Role-Based Routing

### Test Scenarios

1. **Super User Test**:
   - Create organization as super user
   - Sign in → Should stay on `/dashboard`
   - Verify access to all features

2. **Instructor Test**:
   - Invite user as instructor
   - Accept invitation → Should redirect to `/dashboard/instructor`
   - Verify instructor-specific features

3. **Student Test**:
   - Invite user as student
   - Accept invitation → Should redirect to `/dashboard/student`
   - Verify student-specific features

4. **Role Switching Test**:
   - Change user's organization role
   - Sign out and sign in → Should redirect to new role's dashboard

### Debug Information

The dashboard layout includes debug information to help troubleshoot routing issues:

```typescript
<DebugInfo
  userRole={userRole}
  organizationRole={organizationRole}
  effectiveRole={effectiveRole}
  userOrganizations={userOrganizations}
  session={session}
/>
```

## Common Issues and Solutions

### 1. User Not Redirected to Correct Dashboard

**Symptoms**: User stays on main dashboard or gets wrong dashboard
**Solutions**:
- Check user's role in database
- Verify organization membership
- Check console logs for role detection
- Ensure proper API responses

### 2. Infinite Redirect Loop

**Symptoms**: Page keeps redirecting
**Solutions**:
- Check role detection logic
- Verify session state
- Ensure proper loading states
- Check for conflicting redirects

### 3. Role Not Detected

**Symptoms**: User gets default student dashboard
**Solutions**:
- Verify database relationships
- Check API endpoints
- Ensure proper data fetching
- Verify organization membership

## Security Considerations

### 1. Role Verification
- All role checks happen server-side
- Client-side routing is for UX only
- API endpoints verify roles independently

### 2. Access Control
- Users can only access their role-appropriate features
- Organization data is isolated by membership
- Course access is controlled by enrollment

### 3. Session Management
- Roles are fetched on each dashboard load
- Changes to roles require re-authentication
- Session expiration handles role changes

## Future Enhancements

### 1. Granular Permissions
- Fine-grained permission system
- Feature-level access control
- Custom role definitions

### 2. Multi-Organization Support
- Role per organization
- Organization switching
- Cross-organization permissions

### 3. Real-time Role Updates
- Live role changes
- Immediate dashboard updates
- WebSocket-based notifications

## Implementation Checklist

- [x] Role-based dashboard routing
- [x] Automatic role detection
- [x] Invitation-based role assignment
- [x] Organization creator privileges
- [x] Debug information display
- [x] Loading states and error handling
- [ ] Role change notifications
- [ ] Permission-based feature access
- [ ] Multi-organization role management
- [ ] Real-time role updates
