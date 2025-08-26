# MindFlow LMS Authentication System Setup

This document provides comprehensive setup instructions for the MindFlow LMS authentication system built with Better Auth and Nodemailer for email functionality.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm
- Email account for sending verification and password reset emails

## Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/mindflow_lms"
   
   # Better Auth Configuration
   BETTER_AUTH_SECRET="your-super-secret-key-here-minimum-32-characters"
   BETTER_AUTH_URL="http://localhost:3000"
   
   # Email Configuration (Required for email verification and password reset)
   EMAIL_PROVIDER="gmail"  # Options: gmail, outlook, yahoo, custom, sendgrid, mailgun
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"  # Use App Password for Gmail
   EMAIL_FROM="noreply@yourdomain.com"
   
   # Next.js Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   
   # Environment
   NODE_ENV="development"
   ```

3. **Generate Better Auth secret**
   ```bash
   # Generate a secure random string (minimum 32 characters)
   openssl rand -base64 32
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm prisma generate
   
   # Run database migrations
   pnpm prisma migrate dev
   
   # (Optional) Seed the database
   pnpm prisma db seed
   ```

5. **Test email configuration**
   ```bash
   # Test your email setup
   pnpm test:email
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

## Email Configuration

### Quick Email Setup

The system now includes Nodemailer for sending email verification and password reset emails. Here are the most common configurations:

#### Gmail (Recommended for Development)
```env
EMAIL_PROVIDER=gmail
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-16-digit-app-password
EMAIL_FROM=your-email@gmail.com
```

**Important**: For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password (not your regular password)
3. Use the App Password in EMAIL_SERVER_PASSWORD

#### Outlook/Hotmail
```env
EMAIL_PROVIDER=outlook
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@outlook.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
```

#### Custom SMTP Server
```env
EMAIL_PROVIDER=custom
EMAIL_SERVER_HOST=smtp.yourdomain.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=noreply@yourdomain.com
```

### Testing Email Configuration

Run the email test script to verify your configuration:

```bash
pnpm test:email
```

This will:
- Check if all required environment variables are set
- Test the connection to your email provider
- Provide troubleshooting tips if there are issues

For detailed email setup instructions, see `EMAIL_SETUP.md`.

## Features Implemented

### 1. User Registration & Authentication
- **Email/Password Authentication**: Secure signup and signin
- **Role-Based Registration**: Users can register as Students, Instructors, or Admins
- **Email Verification**: Required before account activation (using Nodemailer)
- **Password Reset**: Secure password recovery via email (using Nodemailer)
- **Session Management**: JWT-based sessions with configurable expiration
- **Logout**: Secure session termination

### 2. Role-Based Access Control
- **Student Dashboard**: View enrolled courses, track progress, continue learning
- **Instructor Dashboard**: Create/manage courses, view student progress, analytics
- **Admin Dashboard**: Full system access, user management, platform analytics

### 3. Session Management
- **Secure Sessions**: JWT-based authentication with configurable expiration
- **Automatic Redirects**: Users are redirected to appropriate dashboards based on role
- **Session Persistence**: Configurable session duration and update intervals

### 4. Security Features
- **Password Hashing**: Secure password storage using scrypt
- **Email Verification**: Prevents unauthorized account creation
- **Role Validation**: Server-side role verification on all protected routes
- **Middleware Protection**: Route-level authentication checks

### 5. User Experience Features
- **Responsive Design**: Mobile-friendly authentication forms
- **Error Handling**: Comprehensive error messages and validation
- **Loading States**: Visual feedback during authentication processes
- **Success Messages**: Clear confirmation of completed actions
- **Form Validation**: Client and server-side validation

### 6. Email Functionality
- **Professional Email Templates**: Beautiful HTML emails with plain text fallback
- **Multiple Email Providers**: Support for Gmail, Outlook, Yahoo, custom SMTP, SendGrid, Mailgun
- **Email Verification**: Required for new account activation
- **Password Reset**: Secure password recovery via email
- **Welcome Emails**: Confirmation emails after successful verification

## Database Schema

The system uses the following key models:

- **User**: Core user information with role and email verification
- **Account**: Authentication provider accounts (Better Auth)
- **Session**: User sessions and tokens (Better Auth)
- **Verification**: Email verification tokens (Better Auth)
- **Course**: Course information and metadata
- **Module**: Course modules/chapters
- **Lesson**: Individual lessons within modules
- **Enrollment**: Student course enrollments
- **LessonCompletion**: Student progress tracking

## API Endpoints

### Authentication Routes (`/api/auth/*`)
- `POST /api/auth/sign-up/email` - User registration
- `POST /api/auth/sign-in/email` - User login
- `POST /api/auth/sign-out` - User logout
- `POST /api/auth/request-password-reset` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/change-password` - Change password (authenticated)

### Protected Routes
- `/dashboard` - Role-based dashboard redirect
- `/admin/*` - Admin-only routes
- `/instructor/*` - Instructor-only routes
- `/student/*` - Student-only routes

## Customization

### Adding Social Authentication

To enable social login providers, update `lib/auth-server.ts`:

```typescript
export const auth = betterAuth({
  // ... existing config
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
})
```

### Customizing Email Templates

Update the email templates in `lib/email-service.ts`:

```typescript
verificationEmail: (userName: string, verificationUrl: string) => ({
  subject: 'Verify your MindFlow account',
  html: `
    <div style="background: #f0f0f0; padding: 20px;">
      <h1>Welcome to MindFlow!</h1>
      <p>Hello ${userName}, please verify your email:</p>
      <a href="${verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">
        Verify Email
      </a>
    </div>
  `,
  text: `Verify your email: ${verificationUrl}`
})
```

### Adding Two-Factor Authentication

Install the 2FA plugin:

```bash
pnpm add @better-auth/2fa
```

Then update your auth configuration:

```typescript
import { twoFactor } from "@better-auth/2fa"

export const auth = betterAuth({
  // ... existing config
  plugins: [twoFactor()],
})
```

## Deployment

### Production Environment Variables
- Set `NODE_ENV=production`
- Use strong, unique secrets for `BETTER_AUTH_SECRET`
- Configure production database URL
- Set up email service credentials (recommend SendGrid or Mailgun for production)
- Configure social OAuth apps for production domains

### Database Migration
```bash
# Production migration
pnpm prisma migrate deploy

# Generate production client
pnpm prisma generate
```

### Build and Start
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Check database permissions

2. **Authentication Errors**
   - Verify `BETTER_AUTH_SECRET` is set and valid
   - Check `BETTER_AUTH_URL` matches your domain
   - Ensure database migrations are complete

3. **Email Not Working**
   - Run `pnpm test:email` to diagnose issues
   - Verify email service credentials
   - Check SMTP settings and ports
   - Ensure `EMAIL_FROM` is configured
   - For Gmail, use App Password, not regular password

4. **Role-Based Access Issues**
   - Verify user roles in database
   - Check middleware configuration
   - Ensure session data includes role information

### Email-Specific Issues

1. **"Invalid login" Error**
   - Gmail/Yahoo: Use App Password, not regular password
   - Outlook: Ensure 2FA is disabled or use App Password

2. **"Connection timeout" Error**
   - Check firewall settings
   - Verify port numbers (587 for TLS, 465 for SSL)
   - Try different ports if available

3. **"Authentication failed" Error**
   - Verify username and password
   - Check if email provider requires special authentication
   - Ensure account is not locked or suspended

### Debug Mode

Enable debug logging:

```env
DEBUG=nodemailer:*
NODE_ENV=development
```

## Security Considerations

- **Secrets**: Never commit `.env` files to version control
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Consider implementing rate limiting for auth endpoints
- **Session Security**: Regularly rotate session secrets
- **Email Security**: Use secure email services and verify sender domains
- **App Passwords**: Use App Passwords for Gmail/Yahoo instead of regular passwords

## Support

For issues related to:
- **Better Auth**: Check [Better Auth documentation](https://better-auth.com)
- **Prisma**: Check [Prisma documentation](https://www.prisma.io/docs)
- **Next.js**: Check [Next.js documentation](https://nextjs.org/docs)
- **Email Configuration**: See `EMAIL_SETUP.md` for detailed email setup instructions

## License

This project is licensed under the MIT License.
