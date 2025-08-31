# Authentication Setup for MindFlow

This document describes the authentication system implemented using Better Auth and Prisma.

## Overview

The authentication system includes:
- User registration and login
- Session management
- Role-based access control (Student, Instructor, Admin)
- Email verification support
- Secure password handling

## Architecture

### Database Schema
- **User**: Core user information with role-based access
- **Account**: Authentication provider accounts (credentials, OAuth)
- **Session**: User sessions for authentication
- **Verification**: Email verification tokens

### Authentication Flow
1. User signs up with email/password
2. Account is created with STUDENT role by default
3. User can sign in with credentials
4. Sessions are managed via database
5. Role-based access control for different features

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User sign out
- `GET /api/auth/session` - Get current session

### Pages
- `/auth/signin` - Sign in page
- `/auth/signup` - Registration page
- `/dashboard` - Protected dashboard (requires authentication)

## Components

### UI Components
- `SignInForm` - Sign in form with validation
- `SignUpForm` - Registration form with validation
- `DashboardPage` - Protected dashboard page

### Hooks
- `useAuth` - Authentication context and state management

## Environment Variables

Required environment variables in `.env`:
```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pnpm add better-auth @prisma/client
   pnpm add -D prisma
   ```

2. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Configure your database URL and SMTP settings

4. **Run the Application**
   ```bash
   pnpm dev
   ```

## Security Features

- Password validation and confirmation
- Session-based authentication
- Role-based access control
- Email verification support
- Secure SMTP configuration

## Future Enhancements

- Password hashing with bcrypt
- OAuth providers (Google, GitHub)
- Two-factor authentication
- Password reset functionality
- Account deletion
- Admin user management

## Notes

- Passwords are currently stored in plain text (should be hashed in production)
- Email verification is configured but not fully implemented
- Role-based access control is set up but not enforced in all routes
- Consider implementing middleware for route protection

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure your DATABASE_URL is correct
2. **SMTP Configuration**: Verify your email credentials and settings
3. **Prisma Client**: Run `npx prisma generate` after schema changes
4. **Environment Variables**: Check that all required variables are set

### Development Tips
- Use the Prisma Studio to inspect your database: `npx prisma studio`
- Check the browser console for authentication errors
- Verify API endpoints are working with tools like Postman
