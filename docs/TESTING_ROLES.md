# Testing Role-Based Dashboard System

## Overview
This guide helps you test the role-based dashboard system to ensure users are properly redirected based on their roles.

## Test Users Setup

### 1. Super User (Admin)
- **Email**: Any email that creates an organization
- **Role**: Will automatically be set to SUPER_ADMIN when they create an organization
- **Dashboard**: `/dashboard` (main dashboard)

### 2. Instructor
- **Email**: Any email invited as an instructor
- **Role**: INSTRUCTOR or LEAD_INSTRUCTOR
- **Dashboard**: `/dashboard/instructor`

### 3. Student
- **Email**: Any email invited as a student
- **Role**: STUDENT
- **Dashboard**: `/dashboard/student`

## Testing Steps

### Step 1: Create a Super User
1. Sign up with a new email (e.g., `admin@test.com`)
2. Complete onboarding and create an organization
3. Verify you stay on `/dashboard` (main dashboard)

### Step 2: Invite an Instructor
1. As a super user, go to Members tab
2. Invite someone with email `instructor@test.com` as an instructor
3. Check the invitation email is sent
4. Accept the invitation with the new user
5. Verify they're redirected to `/dashboard/instructor`

### Step 3: Invite a Student
1. As a super user or instructor, invite someone with email `student@test.com` as a student
2. Check the invitation email is sent
3. Accept the invitation with the new user
4. Verify they're redirected to `/dashboard/student`

## Debug Information

The system now includes console logging to help debug role detection:

```javascript
console.log("User role:", userRole);
console.log("Organization role:", organizationRole);
console.log("Effective role:", effectiveRole);
console.log("User organizations:", userOrganizations);
```

## Common Issues & Solutions

### Issue: User stuck on loading page
**Solution**: Check browser console for role detection logs

### Issue: User not redirected to correct dashboard
**Solution**: Verify the user's role in the database and organization membership

### Issue: Email invitations not working
**Solution**: Check environment variables and SMTP configuration

## Database Queries for Debugging

### Check User Role
```sql
SELECT id, email, role FROM "user" WHERE email = 'user@example.com';
```

### Check Organization Membership
```sql
SELECT om.role, o.name 
FROM organization_members om 
JOIN organizations o ON om.organization_id = o.id 
WHERE om.user_id = 'user_id_here';
```

### Check Organization Creator
```sql
SELECT o.name, o.created_by, u.email 
FROM organizations o 
JOIN "user" u ON o.created_by = u.id;
```

## Testing Checklist

- [ ] Super user can create organization and access main dashboard
- [ ] Instructor invitation email is sent and received
- [ ] Instructor is redirected to instructor dashboard
- [ ] Student invitation email is sent and received
- [ ] Student is redirected to student dashboard
- [ ] Role changes are reflected immediately
- [ ] Console logs show correct role detection
- [ ] No React hooks errors in console

## Environment Variables Required

Make sure these are set in your `.env.local`:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=felixkent360@gmail.com
SMTP_PASSWORD=cpvh yrir arbk dfyp
EMAIL_FROM=felixkent360@gmail.com

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mindflow"
```

## Next Steps After Testing

1. **Verify Role Detection**: Check console logs for correct role identification
2. **Test Navigation**: Ensure users are redirected to appropriate dashboards
3. **Test Invitations**: Verify email system works for all user types
4. **Test Role Changes**: Ensure role updates are reflected immediately
5. **Performance**: Check for any performance issues with role detection



