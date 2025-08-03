# Authentication System Testing Checklist

## Pre-Testing Setup

- [ ] Ensure development server is running (`npm run dev`)
- [ ] Verify database connection is working
- [ ] Check that all environment variables are set correctly
- [ ] Clear browser cache and cookies
- [ ] Open browser developer tools for monitoring network requests and console logs

## 1. User Registration Testing

### Valid Registration
- [ ] Navigate to `/auth`
- [ ] Switch to "Create Account" mode
- [ ] Fill in valid data:
  - Name: "Test User"
  - Email: "test@example.com" (use a unique email)
  - Password: "password123" (8+ characters)
- [ ] Click "Create Account"
- [ ] Verify loading state shows with spinner
- [ ] Verify success toast appears: "Account created!"
- [ ] Verify redirect to `/dashboard`
- [ ] Verify user is logged in (check sidebar/navbar shows user info)

### Invalid Registration
- [ ] Navigate to `/auth` (sign out first if needed)
- [ ] Try registration with existing email
  - [ ] Verify error message: "This email is already registered..."
- [ ] Try registration with short password (< 8 characters)
  - [ ] Verify error message about password length
- [ ] Try registration with empty fields
  - [ ] Verify HTML5 validation prevents submission
- [ ] Try registration with invalid email format
  - [ ] Verify HTML5 validation prevents submission

## 2. User Sign-In Testing

### Valid Sign-In
- [ ] Navigate to `/auth`
- [ ] Ensure in "Sign In" mode
- [ ] Enter valid credentials from registration test
- [ ] Click "Sign In"
- [ ] Verify loading state shows with spinner
- [ ] Verify success toast appears: "Welcome back!"
- [ ] Verify redirect to `/dashboard`
- [ ] Verify user is logged in

### Invalid Sign-In
- [ ] Navigate to `/auth` (sign out first if needed)
- [ ] Try sign-in with wrong password
  - [ ] Verify error message: "Invalid email or password..."
- [ ] Try sign-in with non-existent email
  - [ ] Verify error message: "No account found with this email..."
- [ ] Try sign-in with empty fields
  - [ ] Verify HTML5 validation prevents submission

## 3. Session Management Testing

### Session Persistence
- [ ] Sign in successfully
- [ ] Refresh the page
  - [ ] Verify user remains logged in
  - [ ] Verify dashboard content loads correctly
- [ ] Close browser tab and reopen
  - [ ] Navigate to `/dashboard`
  - [ ] Verify user remains logged in
- [ ] Open new browser tab
  - [ ] Navigate to `/dashboard`
  - [ ] Verify user is logged in across tabs

### Session Validation
- [ ] While logged in, navigate to `/auth`
  - [ ] Verify automatic redirect to `/dashboard`
- [ ] While logged out, navigate to `/dashboard`
  - [ ] Verify automatic redirect to `/auth`
- [ ] While logged out, navigate to `/courses`
  - [ ] Verify automatic redirect to `/auth`
- [ ] While logged out, navigate to `/my-courses`
  - [ ] Verify automatic redirect to `/auth`

## 4. Sign-Out Testing

### Sidebar Sign-Out (Dashboard Layout)
- [ ] Sign in and navigate to `/dashboard`
- [ ] Click the "Sign Out" button in sidebar
- [ ] Verify confirmation dialog appears
- [ ] Click "Cancel" - verify nothing happens
- [ ] Click "Sign Out" again, then "Sign Out" in dialog
- [ ] Verify loading state during sign-out
- [ ] Verify success toast appears
- [ ] Verify redirect to `/auth`
- [ ] Try accessing `/dashboard` - verify redirect to `/auth`

### Navbar Sign-Out (Other Layouts)
- [ ] Sign in and navigate to `/courses`
- [ ] Click the "Sign Out" button in navbar
- [ ] Verify loading state during sign-out
- [ ] Verify success toast appears
- [ ] Verify redirect to `/auth`
- [ ] Try accessing protected routes - verify redirect to `/auth`

## 5. Protected Routes Testing

### Authenticated Access
- [ ] Sign in successfully
- [ ] Navigate to each protected route and verify access:
  - [ ] `/dashboard` - loads correctly
  - [ ] `/courses` - loads correctly
  - [ ] `/my-courses` - loads correctly
  - [ ] Any instructor routes (if applicable)

### Unauthenticated Access
- [ ] Sign out completely
- [ ] Try to access each protected route directly:
  - [ ] `/dashboard` - redirects to `/auth`
  - [ ] `/courses` - redirects to `/auth`
  - [ ] `/my-courses` - redirects to `/auth`
  - [ ] Any instructor routes - redirects to `/auth`

## 6. User Interface Testing

### Form Validation
- [ ] Test password visibility toggle works
- [ ] Test form switching between sign-in and sign-up modes
- [ ] Test all form fields are properly labeled
- [ ] Test form is accessible via keyboard navigation
- [ ] Test form submission with Enter key

### Loading States
- [ ] Verify loading spinners appear during auth operations
- [ ] Verify buttons are disabled during loading
- [ ] Verify loading text is descriptive
- [ ] Verify form fields are disabled during loading

### Error Display
- [ ] Verify error toasts appear for auth failures
- [ ] Verify error messages are user-friendly
- [ ] Verify error toasts auto-dismiss after reasonable time
- [ ] Verify multiple errors don't stack up

### Success Feedback
- [ ] Verify success toasts appear for successful operations
- [ ] Verify success messages are encouraging
- [ ] Verify success toasts auto-dismiss

## 7. Database Integration Testing

### User Creation
- [ ] After successful registration, check database:
  - [ ] User record exists in `users` table
  - [ ] Email is stored correctly
  - [ ] Password is hashed (not plain text)
  - [ ] Role is set correctly (default: STUDENT)
  - [ ] Timestamps are set

### Session Management
- [ ] After successful sign-in, check database:
  - [ ] Session record exists in `sessions` table
  - [ ] Session token is generated
  - [ ] Expiration time is set correctly
  - [ ] User ID is linked correctly

### Account Records
- [ ] Check `accounts` table for auth provider records
- [ ] Verify account records link to correct user

## 8. Error Handling Testing

### Network Errors
- [ ] Disconnect internet during sign-in
  - [ ] Verify appropriate error message
- [ ] Reconnect and retry - verify it works

### Server Errors
- [ ] If possible, simulate server downtime
  - [ ] Verify graceful error handling
  - [ ] Verify user-friendly error messages

### Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if available)
- [ ] Test in Edge

## 9. Security Testing

### Password Security
- [ ] Verify passwords are not visible in network requests
- [ ] Verify passwords are not logged in console
- [ ] Verify password requirements are enforced

### Session Security
- [ ] Verify session tokens are not exposed in URLs
- [ ] Verify session tokens are httpOnly (check in dev tools)
- [ ] Verify sessions expire appropriately

## 10. Mobile Responsiveness

### Mobile Layout
- [ ] Test on mobile device or browser dev tools mobile view
- [ ] Verify auth form is usable on mobile
- [ ] Verify sidebar/navbar works on mobile
- [ ] Verify sign-out functionality works on mobile

## Test Results Summary

### Passed Tests
- [ ] All registration flows work correctly
- [ ] All sign-in flows work correctly
- [ ] Session management works correctly
- [ ] Sign-out functionality works correctly
- [ ] Protected routes are properly secured
- [ ] Error handling is user-friendly
- [ ] UI is responsive and accessible
- [ ] Database integration is working
- [ ] Security measures are in place

### Failed Tests
- [ ] List any failing tests here with details
- [ ] Include steps to reproduce issues
- [ ] Note any workarounds or fixes needed

### Notes
- Date tested: ___________
- Tester: ___________
- Browser/Version: ___________
- Any additional observations: ___________

## Post-Testing Actions

- [ ] Document any bugs found
- [ ] Create issues for any problems
- [ ] Verify all requirements from the spec are met
- [ ] Update documentation if needed
- [ ] Consider additional test cases for edge cases