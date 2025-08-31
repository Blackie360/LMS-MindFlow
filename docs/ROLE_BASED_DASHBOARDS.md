# Role-Based Dashboard System

## Overview

MindFlow now implements a comprehensive role-based dashboard system that automatically routes users to different interfaces based on their role within the organization. This system ensures that users only see relevant features and data for their specific role.

## User Roles

### 1. Super User (Admin/Super Admin)
- **Access**: Full dashboard with all features
- **Capabilities**:
  - Create and manage organizations
  - Invite instructors and students
  - Manage all organization settings
  - Access to all dashboard features
- **Dashboard**: `/dashboard` (main dashboard)

### 2. Instructor (Lead Instructor/Instructor)
- **Access**: Instructor-specific dashboard
- **Capabilities**:
  - Create and manage courses
  - Enroll students in courses
  - Track student progress
  - Access to course management features
- **Dashboard**: `/dashboard/instructor`

### 3. Student
- **Access**: Student-specific dashboard
- **Capabilities**:
  - View enrolled courses
  - Track learning progress
  - Access course content
  - View achievements
- **Dashboard**: `/dashboard/student`

## Dashboard Routing

### Automatic Role Detection
The system automatically detects user roles through:

1. **User Role**: Stored in the User model (`Role` enum)
2. **Organization Role**: Stored in OrganizationMember model
3. **Effective Role**: Combination of both, with organization role taking precedence

### Routing Logic
```typescript
// Dashboard layout automatically routes users
if (effectiveRole === "admin" || effectiveRole === "super_admin") {
  // Super User Dashboard
} else if (effectiveRole === "instructor" || effectiveRole === "lead_instructor") {
  // Instructor Dashboard
} else {
  // Student Dashboard
}
```

## Dashboard Features

### Super User Dashboard (`/dashboard`)
- **Overview Tab**: Profile, quick actions, organization stats
- **School Tab**: Organization management and settings
- **Members Tab**: Invite and manage users
- **Courses Tab**: Course creation and management
- **Settings Tab**: Account preferences

### Instructor Dashboard (`/dashboard/instructor`)
- **Overview Tab**: Quick actions and course summary
- **Courses Tab**: Course creation and management
- **Students Tab**: Student enrollment and management
- **Analytics Tab**: Learning progress tracking

### Student Dashboard (`/dashboard/student`)
- **Overview Tab**: Learning summary and quick actions
- **My Courses Tab**: Enrolled courses
- **Progress Tab**: Learning achievements
- **Achievements Tab**: Badges and milestones

## Invitation System

### Email-Based Invitations
- **Technology**: Nodemailer with Gmail SMTP
- **Templates**: HTML emails with MindFlow branding
- **Security**: Token-based with 7-day expiration
- **Roles**: Can invite as instructor or student

### Invitation Flow
1. Super user/instructor sends invitation
2. Email sent with secure token
3. User clicks invitation link
4. User creates account or signs in
5. User automatically added to organization
6. User redirected to appropriate dashboard

### API Endpoints
- `POST /api/auth/invitation/send` - Send invitation
- `GET /api/auth/invitation/verify` - Verify token
- `POST /api/auth/invitation/accept` - Accept invitation

## Styling & Theme

### Design System
- **Framework**: shadcn/ui components
- **Theme**: Dark gradient background (blue-900 to purple-900)
- **Accents**: Orange (#f97316) for primary actions
- **Consistency**: Matches landing page styling

### Color Scheme
- **Primary**: Orange (#f97316)
- **Background**: Dark gradients
- **Cards**: White with transparency (bg-white/10)
- **Text**: White with opacity variations

## Database Schema

### Key Models
```prisma
model User {
  id    String @id
  role  Role   @default(STUDENT)
  // ... other fields
}

model OrganizationMember {
  organizationId String
  userId         String
  role           String // admin, leadInstructor, instructor, student
  // ... other fields
}

model OrganizationInvitation {
  organizationId String
  email          String
  role           String
  token          String @unique
  expiresAt      DateTime
  // ... other fields
}
```

## Security Features

### Authentication
- **Session Management**: Better Auth integration
- **Role Verification**: Server-side role checking
- **Invitation Security**: Token-based with expiration
- **Access Control**: Role-based route protection

### Data Isolation
- Users only see data relevant to their role
- Organization-level data isolation
- Course-level access control

## Implementation Details

### File Structure
```
app/
├── dashboard/
│   ├── layout.tsx          # Role-based routing
│   ├── page.tsx            # Super user dashboard
│   ├── instructor/
│   │   └── page.tsx        # Instructor dashboard
│   └── student/
│       └── page.tsx        # Student dashboard
└── api/
    └── auth/
        └── invitation/      # Invitation endpoints

components/
├── organization/            # Organization management
├── courses/                 # Course management
└── ui/                     # shadcn/ui components

lib/
├── email.ts                # Email utilities
├── auth.ts                 # Authentication
└── db.ts                   # Database
```

### Key Components
- **DashboardLayout**: Handles role-based routing
- **Email Utilities**: Nodemailer integration
- **Role Detection**: Automatic user role identification
- **Invitation Forms**: User invitation interfaces

## Testing

### Setup Requirements
1. Environment variables configured
2. Database migrations applied
3. Email service configured
4. Test users created

### Test Scenarios
1. **Super User Flow**: Create organization, invite users
2. **Instructor Flow**: Create courses, enroll students
3. **Student Flow**: Accept invitation, access courses
4. **Role Switching**: Test different user roles

### Common Issues
1. **Role Detection**: Verify database relationships
2. **Email Sending**: Check SMTP configuration
3. **Routing**: Ensure proper role mapping
4. **Styling**: Verify theme consistency

## Future Enhancements

### Planned Features
- **Advanced Analytics**: Detailed learning insights
- **Role Permissions**: Granular permission system
- **Team Management**: Department and team structures
- **Mobile Optimization**: Responsive dashboard design

### Scalability
- **Caching**: Redis for session management
- **Queue System**: Background email processing
- **CDN**: Static asset optimization
- **Monitoring**: Performance and error tracking
