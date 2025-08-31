# Better Auth Organization Plugin Implementation Guide

## Overview
This guide walks you through implementing the Better Auth Organization plugin for your MindFlow LMS system, enabling multi-tenancy, team management, and role-based access control.

## 🚀 **Step 1: Setup & Configuration**

### 1.1 Install Dependencies
```bash
# Core Better Auth (already installed)
pnpm add better-auth

# UI Components (already installed)
npx shadcn@latest add select textarea dialog sheet tabs table form --yes
```

### 1.2 Environment Variables
Add to your `.env` file:
```bash
BETTER_AUTH_SECRET="your-secret-key-here-change-this-in-production"
BETTER_AUTH_URL="http://localhost:3000"
```

### 1.3 Update Auth Configuration (`lib/auth.ts`)
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    // ... existing mappings
  }),
  emailAndPassword: { enabled: true },
  emailVerification: { /* ... */ },
  organization: {
    // Custom fields for schools
    additionalFields: {
      schoolCode: { type: "string", required: false },
      subscriptionTier: { type: "string", required: false, default: "basic" },
      maxTeams: { type: "number", required: false, default: 5 },
      maxMembersPerTeam: { type: "number", required: false, default: 50 },
    },
    // Restrict creation to admins
    allowUserToCreateOrganization: async (user) => {
      return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    },
    // Lifecycle hooks
    organizationCreation: {
      beforeCreate: async (data, user) => ({
        ...data,
        metadata: { type: "school", createdBy: user.id }
      }),
      afterCreate: async (organization, user) => {
        // Create default team and resources
      }
    }
  }
});
```

## 🏗️ **Step 2: Database Schema**

### 2.1 Generate Better Auth Schema
```bash
npx @better-auth/cli generate
```

### 2.2 Merge with Your Existing Schema
Your existing schema already has the structure needed. The organization plugin will add:
- `Organization` table (schools)
- `OrganizationMember` table (enrollments)
- `Team` table (departments)
- `TeamMember` table (team assignments)
- `OrganizationInvitation` table (invitations)

### 2.3 Push Schema to Database
```bash
npx prisma db push
```

## 👥 **Step 3: Organization Lifecycle**

### 3.1 Create School (Organization)
```typescript
// components/organization/CreateSchoolForm.tsx
const { data, error } = await authClient.organization.create({
  name: "MindFlow Academy",
  slug: "mindflow-academy",
  additionalFields: {
    schoolCode: "MFA001",
    subscriptionTier: "premium",
    maxTeams: 20,
    maxMembersPerTeam: 200,
  },
});
```

### 3.2 Default Resources Creation
```typescript
// In auth.ts afterCreate hook
afterCreate: async (organization, user) => {
  // Create default "General" team
  await prisma.team.create({
    data: {
      name: "General",
      slug: "general",
      organizationId: organization.id,
      createdBy: user.id,
    },
  });
}
```

## 📧 **Step 4: Invitations & Members**

### 4.1 Send Invitation
```typescript
// components/organization/InviteInstructorForm.tsx
const { data, error } = await authClient.organization.invite({
  organizationId,
  email: "instructor@example.com",
  role: "instructor",
  additionalFields: {
    department: "Science",
    teamId: "science-dept",
  },
});
```

### 4.2 Email Verification
```typescript
// In auth.ts
invitation: {
  requireEmailVerification: true,
  sendInvitationEmail: async ({ invitation, organization, inviter }) => {
    // Implement your email sending logic
    await sendEmail({
      to: invitation.email,
      subject: `Join ${organization.name}`,
      template: 'invitation',
      data: { invitation, organization, inviter }
    });
  }
}
```

## 🎯 **Step 5: Active Organization/Team State**

### 5.1 Organization Switcher
```typescript
// components/organization/OrganizationSwitcher.tsx
const [activeOrganization, setActiveOrganization] = useState<string>("");
const [activeTeam, setActiveTeam] = useState<string>("");

// Use Better Auth hooks when available
const { data: organizations } = authClient.useListOrganizations();
const { data: teams } = authClient.useListTeams({ organizationId: activeOrganization });
```

### 5.2 Context Management
```typescript
// lib/contexts/OrganizationContext.tsx
export const OrganizationContext = createContext({
  activeOrganization: null,
  activeTeam: null,
  setActiveOrganization: () => {},
  setActiveTeam: () => {},
});
```

## 🔐 **Step 6: Roles & Permissions**

### 6.1 Custom Role Definitions
```typescript
// In auth.ts
const accessControl = createAccessControl({
  roles: {
    superAdmin: {
      permissions: ["organization:create", "organization:delete", "user:manage"]
    },
    admin: {
      permissions: ["organization:manage", "team:manage", "course:manage"]
    },
    leadInstructor: {
      permissions: ["team:manage", "course:create", "course:grade"]
    },
    instructor: {
      permissions: ["course:manage", "course:grade"]
    },
    student: {
      permissions: ["course:enroll", "course:view"]
    }
  }
});
```

### 6.2 Permission Checks
```typescript
// In components
const canCreateCourse = await authClient.hasPermission("course:create");
const canManageTeam = await authClient.checkRolePermission("leadInstructor");
```

## 🏢 **Step 7: Team Support**

### 7.1 Create Team
```typescript
const { data, error } = await authClient.team.create({
  organizationId: activeOrganization,
  name: "Science Department",
  slug: "science-dept",
  additionalFields: {
    departmentCode: "SCI",
    maxMembers: 50,
    category: "academic",
  },
});
```

### 7.2 Team Member Management
```typescript
// Add member to team
const { data, error } = await authClient.team.addMember({
  teamId,
  userId,
  role: "instructor",
});
```

## 📊 **Step 8: Admin Panel**

### 8.1 Organization Dashboard
```typescript
// app/organizations/[id]/page.tsx
export default function OrganizationDashboard({ params }: { params: { id: string } }) {
  const { data: organization } = authClient.useOrganization(params.id);
  const { data: members } = authClient.useListMembers({ organizationId: params.id });
  const { data: teams } = authClient.useListTeams({ organizationId: params.id });
  
  return (
    <div>
      <h1>{organization?.name}</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### 8.2 Member Management
```typescript
// components/organization/MemberManagement.tsx
export function MemberManagement({ organizationId }: { organizationId: string }) {
  const { data: members, mutate } = authClient.useListMembers({ organizationId });
  
  const updateRole = async (userId: string, newRole: string) => {
    await authClient.organization.updateMember({
      organizationId,
      userId,
      role: newRole,
    });
    mutate(); // Refresh data
  };
  
  return (
    <div>
      {members?.map(member => (
        <div key={member.id}>
          {member.user.name} - {member.role}
          <Button onClick={() => updateRole(member.userId, "instructor")}>
            Make Instructor
          </Button>
        </div>
      ))}
    </div>
  );
}
```

## 🎨 **Step 9: Schema Customization**

### 9.1 Additional Fields
```typescript
// In auth.ts
organization: {
  additionalFields: {
    schoolCode: { type: "string", required: false },
    branding: {
      type: "object",
      properties: {
        logo: { type: "string" },
        primaryColor: { type: "string" },
      }
    }
  }
}
```

### 9.2 Type Safety
```typescript
// types/organization.ts
interface Organization {
  id: string;
  name: string;
  slug: string;
  schoolCode?: string;
  subscriptionTier: string;
  maxTeams: number;
  maxMembersPerTeam: number;
  branding?: {
    logo?: string;
    primaryColor?: string;
  };
}
```

## 🧪 **Step 10: Testing & Validation**

### 10.1 Test Organization Creation
```bash
# Start your dev server
pnpm dev

# Navigate to /organizations/create
# Test creating a new school
```

### 10.2 Test Member Invitations
```bash
# Test sending invitations
# Verify email verification flow
# Test role assignments
```

### 10.3 Test Permission System
```bash
# Test different user roles
# Verify permission restrictions
# Test team management
```

## 🚀 **Step 11: Production Deployment**

### 11.1 Environment Variables
```bash
# Production .env
BETTER_AUTH_SECRET="your-production-secret-key"
BETTER_AUTH_URL="https://yourdomain.com"
```

### 11.2 Database Migration
```bash
# Generate production migration
npx prisma migrate dev --name add-organization-support

# Deploy to production
npx prisma migrate deploy
```

### 11.3 Email Service Integration
```typescript
// Implement production email service
sendInvitationEmail: async ({ invitation, organization, inviter }) => {
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: invitation.email,
    subject: `Join ${organization.name}`,
    html: generateInvitationEmail(invitation, organization, inviter)
  });
}
```

## 📋 **Checklist Summary**

- [ ] Install Better Auth and dependencies
- [ ] Configure environment variables
- [ ] Update auth configuration with organization plugin
- [ ] Generate and merge database schema
- [ ] Implement organization creation flow
- [ ] Set up invitation system with email verification
- [ ] Create organization/team switcher
- [ ] Implement role-based permissions
- [ ] Build team management features
- [ ] Create admin dashboard
- [ ] Add custom fields and branding
- [ ] Test all workflows
- [ ] Deploy to production

## 🎯 **Next Steps**

1. **Start with basic organization creation**
2. **Add team management**
3. **Implement invitation system**
4. **Build permission system**
5. **Create admin interfaces**
6. **Add advanced features**

This implementation provides a solid foundation for multi-tenant LMS functionality with proper role-based access control and team management.
