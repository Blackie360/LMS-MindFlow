# Role-Based Routing Testing Guide

## Overview

This guide provides comprehensive testing procedures for the role-based routing system in MindFlow. It covers all user flows, edge cases, and troubleshooting steps.

## Test Environment Setup

### Prerequisites
1. Database with test data
2. Email service configured
3. Test users with different roles
4. Test organizations created

### Test Users Setup
Create test users with the following roles:
- **Super User**: Organization creator
- **Instructor**: Organization member with instructor role
- **Student**: Organization member with student role
- **Admin**: Organization member with admin role

## Test Scenarios

### 1. Regular Sign In Flow

#### Test Case 1.1: Super User Sign In
**Steps**:
1. Navigate to `/auth/signin`
2. Sign in with super user credentials
3. Verify redirect to `/dashboard`
4. Verify user stays on main dashboard (no redirect)
5. Verify access to all super user features

**Expected Results**:
- User redirected to `/dashboard`
- No further redirects
- Access to organization management
- Access to member management
- Access to course management

#### Test Case 1.2: Instructor Sign In
**Steps**:
1. Navigate to `/auth/signin`
2. Sign in with instructor credentials
3. Verify redirect to `/dashboard`
4. Verify automatic redirect to `/dashboard/instructor`
5. Verify instructor-specific features

**Expected Results**:
- Initial redirect to `/dashboard`
- Automatic redirect to `/dashboard/instructor`
- Access to course creation
- Access to student management
- No access to organization settings

#### Test Case 1.3: Student Sign In
**Steps**:
1. Navigate to `/auth/signin`
2. Sign in with student credentials
3. Verify redirect to `/dashboard`
4. Verify automatic redirect to `/dashboard/student`
5. Verify student-specific features

**Expected Results**:
- Initial redirect to `/dashboard`
- Automatic redirect to `/dashboard/student`
- Access to enrolled courses
- Access to learning progress
- No access to course creation

### 2. Invitation Acceptance Flow

#### Test Case 2.1: Instructor Invitation
**Steps**:
1. Send invitation to new user as instructor
2. User clicks invitation link
3. User creates account or signs in
4. Verify direct redirect to `/dashboard/instructor`
5. Verify instructor role assignment

**Expected Results**:
- Direct redirect to `/dashboard/instructor`
- No intermediate redirects
- User assigned instructor role
- Access to instructor features

#### Test Case 2.2: Student Invitation
**Steps**:
1. Send invitation to new user as student
2. User clicks invitation link
3. User creates account or signs in
4. Verify direct redirect to `/dashboard/student`
5. Verify student role assignment

**Expected Results**:
- Direct redirect to `/dashboard/student`
- No intermediate redirects
- User assigned student role
- Access to student features

### 3. Sign Up Flow

#### Test Case 3.1: New User Sign Up
**Steps**:
1. Navigate to `/auth/signup`
2. Create new account
3. Verify redirect to `/onboarding`
4. Complete onboarding process
5. Verify redirect to `/dashboard`
6. Verify role detection and routing

**Expected Results**:
- Redirect to `/onboarding` after signup
- Redirect to `/dashboard` after onboarding
- Role detection works correctly
- Appropriate dashboard displayed

### 4. Role Change Scenarios

#### Test Case 4.1: Role Update
**Steps**:
1. Sign in as user with current role
2. Admin changes user's role in database
3. User signs out and signs in again
4. Verify redirect to new role's dashboard

**Expected Results**:
- User redirected to new role's dashboard
- Access to new role's features
- No access to previous role's features

#### Test Case 4.2: Organization Membership Change
**Steps**:
1. Sign in as user
2. Admin changes user's organization role
3. User signs out and signs in again
4. Verify redirect based on new organization role

**Expected Results**:
- Organization role takes precedence
- User redirected to appropriate dashboard
- Access based on new organization role

## Edge Cases and Error Scenarios

### 1. No Role Assigned
**Scenario**: User has no role in database
**Expected**: Default to student dashboard

### 2. Invalid Role
**Scenario**: User has invalid role value
**Expected**: Default to student dashboard

### 3. Multiple Organizations
**Scenario**: User belongs to multiple organizations
**Expected**: Use first organization's role

### 4. Session Expired
**Scenario**: User session expires during role detection
**Expected**: Redirect to sign in page

### 5. API Errors
**Scenario**: Role detection API fails
**Expected**: Show error message, retry mechanism

## Debugging and Troubleshooting

### 1. Console Logs
Check browser console for role detection logs:
```javascript
console.log("User role:", userRole);
console.log("Organization role:", organizationRole);
console.log("Effective role:", effectiveRole);
console.log("User organizations:", userOrganizations);
```

### 2. Debug Information
The dashboard layout includes debug information:
- User role from database
- Organization role from membership
- Effective role calculation
- User organizations
- Session information

### 3. Database Verification
Check database for:
- User role in `User` table
- Organization membership in `OrganizationMember` table
- Organization creator in `Organization` table

### 4. API Endpoints
Verify API responses:
- `GET /api/auth/user/{id}` - User role
- `GET /api/auth/organization/list` - User organizations
- `GET /api/auth/organization/{id}/member/{userId}` - Organization role

## Performance Testing

### 1. Role Detection Speed
- Measure time from sign in to dashboard display
- Test with different network conditions
- Verify loading states work correctly

### 2. Multiple Users
- Test concurrent sign ins
- Verify no role conflicts
- Check database performance

## Security Testing

### 1. Role Bypass Attempts
- Try accessing other role's dashboards directly
- Verify server-side role checking
- Test with modified session data

### 2. Organization Isolation
- Verify users only see their organization's data
- Test cross-organization access attempts
- Check data isolation

## Automated Testing

### 1. Unit Tests
```typescript
// Test role detection logic
describe('Role Detection', () => {
  it('should detect super admin role', () => {
    // Test organization creator detection
  });
  
  it('should prioritize organization role', () => {
    // Test role priority
  });
  
  it('should default to student role', () => {
    // Test default fallback
  });
});
```

### 2. Integration Tests
```typescript
// Test complete sign in flow
describe('Sign In Flow', () => {
  it('should redirect instructor to instructor dashboard', async () => {
    // Test complete flow
  });
  
  it('should redirect student to student dashboard', async () => {
    // Test complete flow
  });
});
```

### 3. E2E Tests
```typescript
// Test with Playwright or Cypress
describe('Role-Based Routing E2E', () => {
  it('should route users to correct dashboards', async () => {
    // Test complete user journey
  });
});
```

## Test Data Setup

### 1. Database Seeding
```sql
-- Create test users
INSERT INTO "user" (id, email, name, role) VALUES
('user1', 'super@test.com', 'Super User', 'ADMIN'),
('user2', 'instructor@test.com', 'Instructor', 'INSTRUCTOR'),
('user3', 'student@test.com', 'Student', 'STUDENT');

-- Create test organization
INSERT INTO "organizations" (id, name, slug, createdBy) VALUES
('org1', 'Test School', 'test-school', 'user1');

-- Create organization memberships
INSERT INTO "organization_members" (id, organizationId, userId, role) VALUES
('mem1', 'org1', 'user1', 'admin'),
('mem2', 'org1', 'user2', 'instructor'),
('mem3', 'org1', 'user3', 'student');
```

### 2. Test Environment Variables
```env
# Test database
DATABASE_URL="postgresql://test:test@localhost:5432/mindflow_test"

# Test email (optional)
SMTP_HOST=localhost
SMTP_PORT=1025
```

## Reporting and Documentation

### 1. Test Results
Document test results including:
- Pass/fail status
- Screenshots of issues
- Console logs
- Performance metrics

### 2. Bug Reports
Include in bug reports:
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Debug information

### 3. Test Coverage
Track test coverage for:
- Role detection logic
- Routing components
- API endpoints
- Error handling

## Maintenance

### 1. Regular Testing
- Run tests after each deployment
- Test with new user roles
- Verify after database changes

### 2. Test Data Cleanup
- Clean up test data after tests
- Reset database state
- Remove test users and organizations

### 3. Test Updates
- Update tests when adding new roles
- Modify tests for new features
- Keep test data current
