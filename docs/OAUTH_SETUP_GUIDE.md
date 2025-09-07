# OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth providers for your MindFlow application.

## Prerequisites

- A Google Cloud Console account
- A GitHub account
- Your application running locally or deployed

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 2. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

Add the following to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## GitHub OAuth Setup

### 1. Create a GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** > **New OAuth App**
3. Fill in the application details:
   - **Application name**: MindFlow (or your preferred name)
   - **Homepage URL**: 
     - For development: `http://localhost:3000`
     - For production: `https://yourdomain.com`
   - **Authorization callback URL**:
     - For development: `http://localhost:3000/api/auth/callback/github`
     - For production: `https://yourdomain.com/api/auth/callback/github`
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client Secret**

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Complete Environment Variables

Your `.env` file should include all the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mindflow"

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth Configuration (NextAuth.js)
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Testing OAuth Providers

1. Start your development server: `pnpm dev`
2. Navigate to `/auth/signin` or `/auth/signup`
3. Click on the **Continue with Google** or **Continue with GitHub** buttons
4. Complete the OAuth flow
5. You should be redirected back to your dashboard

## Features

### Social Login Buttons
- **Google**: Users can sign in with their Google account
- **GitHub**: Users can sign in with their GitHub account
- **Email & Password**: Traditional credentials-based authentication

### Last Sign-in Method Tracking
- The dashboard displays which method the user last used to sign in
- Icons and labels show whether they used Google, GitHub, or email/password
- This information is stored in the JWT token and session

### User Experience
- Social login buttons are prominently displayed on both sign-in and sign-up forms
- Clear visual separation between social and traditional authentication
- Consistent styling with the rest of the application

## Troubleshooting

### Common Issues

1. **"Invalid client" error**: Check that your Client ID and Client Secret are correct
2. **"Redirect URI mismatch" error**: Ensure the callback URL in your OAuth app matches exactly
3. **"Access denied" error**: Check that the OAuth app is properly configured and not in development mode restrictions

### Development vs Production

- **Development**: Use `http://localhost:3000` for all URLs
- **Production**: Replace with your actual domain (e.g., `https://yourdomain.com`)

### Security Notes

- Never commit your `.env` file to version control
- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Regularly rotate your OAuth client secrets
- Monitor OAuth usage in your provider dashboards

## Next Steps

After setting up OAuth providers:

1. Test both Google and GitHub authentication flows
2. Verify that user information is properly stored
3. Check that the last sign-in method is correctly displayed
4. Test the complete user journey from sign-up to dashboard

For additional help, refer to the [NextAuth.js documentation](https://next-auth.js.org/providers/) or the specific provider documentation.
