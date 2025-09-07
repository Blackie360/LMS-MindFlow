# Production OAuth Setup for Vercel

This guide will help you set up OAuth providers for your production MindFlow application on Vercel.

## Current Issues

Based on the logs, I can see that:
1. ✅ GitHub OAuth is working (account creation successful)
2. ❌ Users are not being redirected to dashboard after OAuth
3. ❌ API route `/api/organization/list` returns 404 (should be `/api/organization`)

## Fixed Issues

1. **API Route Mismatch**: Updated dashboard layout to use correct API endpoint
2. **OAuth Redirect**: Social login should now redirect properly

## Required Environment Variables for Production

Add these to your Vercel environment variables:

```env
# Database
DATABASE_URL=your-production-database-url

# NextAuth.js
NEXTAUTH_SECRET=your-production-secret-here
NEXTAUTH_URL=https://mindflowlms.vercel.app

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://mindflowlms.vercel.app
```

## OAuth Provider Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select your project
3. Enable Google+ API
4. Go to **APIs & Services** > **Credentials**
5. Create **OAuth 2.0 Client ID**
6. Add authorized redirect URI: `https://mindflowlms.vercel.app/api/auth/callback/google`
7. Copy Client ID and Secret to Vercel

### GitHub OAuth Setup

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Create **New OAuth App**
3. Set:
   - **Homepage URL**: `https://mindflowlms.vercel.app`
   - **Authorization callback URL**: `https://mindflowlms.vercel.app/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add to Vercel environment variables

## Vercel Deployment Steps

1. **Set Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to **Settings** > **Environment Variables**
   - Add all the variables listed above

2. **Redeploy**:
   - Trigger a new deployment after adding environment variables
   - Or push a new commit to trigger automatic deployment

3. **Test OAuth Flow**:
   - Visit `https://mindflowlms.vercel.app/auth/signin`
   - Try both Google and GitHub sign-in
   - Verify redirect to dashboard works

## Debugging Steps

If OAuth still doesn't work:

1. **Check Vercel Function Logs**:
   - Go to Vercel dashboard > Functions tab
   - Look for errors in `/api/auth/callback/google` or `/api/auth/callback/github`

2. **Verify Environment Variables**:
   - Ensure all OAuth variables are set correctly
   - Check that `NEXTAUTH_URL` matches your domain exactly

3. **Test API Endpoints**:
   - Visit `https://mindflowlms.vercel.app/api/auth/session` to check auth status
   - Check if `/api/organization` returns data (not 404)

## Common Issues

1. **"Invalid redirect URI"**: Check that callback URLs match exactly in OAuth provider settings
2. **"Invalid client"**: Verify Client ID and Secret are correct
3. **"Access denied"**: Check OAuth app permissions and settings
4. **Redirect not working**: Ensure `NEXTAUTH_URL` is set correctly

## Next Steps

After setting up OAuth providers:

1. Test the complete authentication flow
2. Verify users can sign in with both Google and GitHub
3. Check that dashboard redirects work properly
4. Test the last sign-in method display feature

The application should now work correctly in production! 🚀
