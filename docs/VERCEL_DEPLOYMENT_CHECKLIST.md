# 🚀 Vercel Deployment Checklist

## Required Environment Variables

Make sure these are set in your Vercel dashboard:

### 1. Database
```bash
DATABASE_URL=postgresql://username:password@host:5432/database
```

### 2. App Configuration
```bash
NEXT_PUBLIC_APP_URL=https://mindflowlms.vercel.app
AUTH_URL=https://mindflowlms.vercel.app
```

### 3. Auth Configuration
```bash
AUTH_SECRET=your-super-secure-secret-key-here
```

### 4. Email Configuration (if using email features)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Common 500 Error Causes

1. **Missing AUTH_SECRET** - This is required for Better Auth
2. **Database connection issues** - Check DATABASE_URL
3. **Missing environment variables** - Ensure all required vars are set
4. **Database not migrated** - Run migrations in production

## Debug Steps

1. Check Vercel Function Logs in the dashboard
2. Verify all environment variables are set
3. Test database connection
4. Check if migrations have been run

## Quick Fix Commands

```bash
# Generate a new AUTH_SECRET
openssl rand -base64 32

# Test database connection
npx prisma db push

# Check environment variables
vercel env ls
```
