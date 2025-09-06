# Debugging Invitation System

## Current Issue
You're getting "Failed to accept invitation" error when trying to accept an invitation.

## What I Fixed

### 1. **Improved Error Handling**
- Added detailed console logging to track the invitation process
- Better error messages with specific failure reasons
- Graceful fallback if session creation fails

### 2. **Role Conversion Fix**
- Fixed the role conversion from invitation role to User enum
- Proper mapping: `instructor` → `INSTRUCTOR`, `student` → `STUDENT`

### 3. **Session Creation Safety**
- Added try-catch around session creation
- If session fails, invitation still gets accepted
- User can then sign in normally

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to accept invitation again
4. Look for logs like:
   ```
   Sending invitation acceptance request...
   Response: { success: true, ... }
   ```

### Step 2: Check Server Logs
1. Look at your terminal where Next.js is running
2. You should see logs like:
   ```
   Accepting invitation with data: { token: "...", name: "...", email: "..." }
   Found invitation: { id: "...", email: "...", role: "..." }
   Creating new user with role: INSTRUCTOR
   Created user: user_id_here
   ```

### Step 3: Check Database
Run these queries to verify data:

```sql
-- Check if invitation exists
SELECT * FROM organization_invitations WHERE token = 'your_token_here';

-- Check if user was created
SELECT * FROM "user" WHERE email = 'invited_email@example.com';

-- Check if user was added to organization
SELECT * FROM organization_members WHERE user_id = 'user_id_here';
```

## Common Issues & Solutions

### Issue 1: "Invalid invitation token"
**Cause**: Token doesn't exist in database
**Solution**: Check if invitation was properly created

### Issue 2: "Invitation has expired"
**Cause**: Invitation is older than 7 days
**Solution**: Send new invitation

### Issue 3: "Invitation already accepted"
**Cause**: User already accepted this invitation
**Solution**: User should sign in instead

### Issue 4: Session creation fails
**Cause**: Better Auth configuration issue
**Solution**: Check auth configuration, but invitation still works

## Testing the Fix

### 1. **Send New Invitation**
- Go to your dashboard as super user
- Invite someone new with a fresh email
- Check if invitation email is received

### 2. **Accept Invitation**
- Click the invitation link
- Fill out the form
- Check console for logs
- Should redirect to appropriate dashboard

### 3. **Verify User Creation**
- Check database for new user
- Check organization membership
- Verify role assignment

## Environment Variables Check

Make sure these are set in `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mindflow"

# NextAuth
NEXTAUTH_URL=http://localhost:3000  # Change to your production URL
NEXTAUTH_SECRET=your-secret-key-here

# Email (for sending invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=felixkent360@gmail.com
SMTP_PASSWORD=cpvh yrir arbk dfyp
EMAIL_FROM=felixkent360@gmail.com
```

## Next Steps

1. **Test with fresh invitation** - Send new invitation to test email
2. **Check console logs** - Look for detailed error information
3. **Verify database** - Ensure data is being created properly
4. **Test role assignment** - Verify user gets correct role and dashboard

## If Still Not Working

1. **Check server logs** for specific error messages
2. **Verify database connection** and schema
3. **Test API endpoints** directly with tools like Postman
4. **Check Better Auth configuration** in `lib/auth.ts`

The improved logging should now give you much more specific information about what's failing in the invitation process.



