# MindFlow App Flow Guide

## Overview
This document outlines the complete user flow for the MindFlow learning management system, from signup to course management.

## User Flow

### 1. Signup & Account Creation
- **Route**: `/auth/signup`
- **Component**: `SignUpForm`
- **Action**: User creates account with name, email, and password
- **Redirect**: After successful signup, user is redirected to `/onboarding`

### 2. Onboarding & Organization Creation
- **Route**: `/onboarding`
- **Component**: `OnboardingPage`
- **Flow**:
  - **Step 1**: Welcome and feature overview
  - **Step 2**: Organization creation using `CreateSchoolForm`
  - **Step 3**: Success confirmation and redirect to dashboard
- **Purpose**: Guide new users through setting up their learning organization

### 3. Dashboard & Role-Based Routing
- **Route**: `/dashboard` (entry point)
- **Component**: `DashboardLayout` (handles role-based routing)
- **Flow**:
  1. User signs in → redirected to `/dashboard`
  2. Dashboard layout detects user role
  3. Automatically redirects to appropriate dashboard:
     - **Super User**: `/dashboard` (main dashboard)
     - **Instructor**: `/dashboard/instructor`
     - **Student**: `/dashboard/student`

### 4. Role-Specific Dashboards

#### Super User Dashboard (`/dashboard`)
- **Features**:
  - **Overview Tab**: User profile, quick actions, and account management
  - **Organization Tab**: School/organization setup and management
  - **Members Tab**: Invite and manage instructors, students, and staff
  - **Courses Tab**: Create and manage educational courses
  - **Settings Tab**: Account preferences and security

#### Instructor Dashboard (`/dashboard/instructor`)
- **Features**:
  - **Overview Tab**: Quick actions and course summary
  - **Courses Tab**: Course creation and management
  - **Students Tab**: Student enrollment and management
  - **Analytics Tab**: Learning progress tracking

#### Student Dashboard (`/dashboard/student`)
- **Features**:
  - **Overview Tab**: Learning summary and quick actions
  - **My Courses Tab**: Enrolled courses
  - **Progress Tab**: Learning achievements
  - **Achievements Tab**: Badges and milestones

## User Roles & Permissions

### Super Users (Organization Creators)
- **Capabilities**:
  - Create and manage organizations
  - Invite instructors and students
  - Manage all organization settings
  - Access to all dashboard features
- **Default Role**: Organization Administrator

### Instructors
- **Capabilities**:
  - Create and manage courses
  - Enroll students in courses
  - Access to course management features
  - Limited organization management access
- **Invitation**: Sent by super users via the Members tab

### Students
- **Capabilities**:
  - Enroll in courses
  - Access course content
  - Track learning progress
  - Limited dashboard access
- **Invitation**: Sent by super users or instructors

## Key Components

### Authentication
- **SignUpForm**: User registration with validation
- **SignInForm**: User login
- **Auth Flow**: Better Auth integration with custom organization support

### Organization Management
- **CreateSchoolForm**: School/organization creation
- **OrganizationSwitcher**: Switch between organizations
- **MemberManagement**: Invite and manage members

### Course Management
- **CreateCourseForm**: Course creation with modules
- **Course Dashboard**: Course overview and management

### Member Invitations
- **InviteInstructorForm**: Invite teaching staff
- **InviteStudentForm**: Invite students for enrollment

## Database Schema

### Core Models
- **User**: Authentication and user profiles
- **Organization**: Schools and learning institutions
- **OrganizationMember**: User-organization relationships
- **Team**: Departments or classes within organizations
- **Course**: Educational content and structure
- **Module**: Course sections
- **Lesson**: Individual learning units
- **Enrollment**: Student-course relationships

### Key Relationships
- Users can belong to multiple organizations
- Organizations have multiple teams and courses
- Courses belong to organizations and have instructors
- Students enroll in courses through invitations

## Styling & UI

### Design System
- **Framework**: shadcn/ui components
- **Theme**: Custom dark theme with orange accents
- **Layout**: Responsive grid-based design
- **Icons**: Lucide React icon set

### Color Scheme
- **Primary**: Orange (#f97316)
- **Secondary**: Blue (#3b82f6)
- **Background**: Dark gradients (blue-900 to purple-900)
- **Text**: White with opacity variations
- **Accents**: Green, purple, and red for different features

## Development Notes

### File Structure
```
app/
├── auth/           # Authentication pages
├── onboarding/     # Organization setup
├── dashboard/      # Main application
└── api/           # API routes

components/
├── auth/          # Authentication forms
├── organization/  # Organization management
├── courses/       # Course management
└── ui/            # shadcn/ui components
```

### Key Features Implemented
- ✅ User authentication with Better Auth
- ✅ Organization creation and management
- ✅ Member invitation system
- ✅ Course creation interface
- ✅ Responsive dashboard design
- ✅ shadcn/ui component integration

### Next Steps
- [ ] Implement course content management
- [ ] Add student enrollment system
- [ ] Create learning progress tracking
- [ ] Implement email notifications
- [ ] Add file upload capabilities
- [ ] Create mobile-responsive views

## Testing the Flow

1. **Start the application**: `npm run dev`
2. **Navigate to signup**: `/auth/signup`
3. **Create account**: Fill in user details
4. **Complete onboarding**: Create organization
5. **Access dashboard**: Manage members and courses
6. **Test invitations**: Invite instructors and students

## Troubleshooting

### Common Issues
- **Organization creation fails**: Check database connection and Better Auth configuration
- **Member invitations not working**: Verify email service configuration
- **Dashboard not loading**: Check authentication state and session management

### Debug Steps
1. Check browser console for errors
2. Verify database migrations are applied
3. Check Better Auth configuration
4. Verify environment variables are set correctly
