# 🚀 Deployment Guide

This guide will help you deploy MindFlow to production with proper environment variable configuration.

## 📋 Prerequisites

- Production database (PostgreSQL recommended)
- Domain name for your application
- Email service (SMTP) for sending invitations
- Hosting platform (Vercel, Railway, DigitalOcean, etc.)

## 🔧 Environment Variables Setup

### Required Environment Variables

Create a `.env` file in your production environment with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@your-db-host:5432/mindflow"

# App Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
AUTH_URL="https://yourdomain.com"

# Auth Configuration
AUTH_SECRET="your-super-secure-secret-key-here"

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Environment Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Your production domain URL | `https://mindflow.vercel.app` |
| `AUTH_URL` | Should match NEXT_PUBLIC_APP_URL | `https://mindflow.vercel.app` |
| `AUTH_SECRET` | Secret key for authentication | Generate with: `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SMTP_*` | Email service configuration | Gmail, SendGrid, etc. |

## 🚀 Deployment Steps

### 1. Database Setup

1. Create a PostgreSQL database on your hosting provider
2. Update the `DATABASE_URL` with your production database credentials
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### 2. Environment Variables

1. Set all required environment variables in your hosting platform
2. Ensure `NEXT_PUBLIC_APP_URL` and `AUTH_URL` match your domain
3. Generate a secure `AUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

### 3. Email Configuration

1. Set up SMTP credentials for your email service
2. For Gmail, use App Passwords (not your regular password)
3. Test email functionality after deployment

### 4. Deploy Application

1. Push your code to your hosting platform
2. Ensure all environment variables are set
3. Deploy and verify the application is running

## 🔍 Post-Deployment Checklist

- [ ] Application loads at your domain
- [ ] User registration works
- [ ] Email invitations are sent successfully
- [ ] Organization creation works
- [ ] All dashboard pages load correctly
- [ ] Authentication flows work properly

## 🛠️ Platform-Specific Notes

### Vercel
- Set environment variables in the Vercel dashboard
- Use Vercel's PostgreSQL addon or external database
- Domain is automatically configured

### Railway
- Set environment variables in Railway dashboard
- Use Railway's PostgreSQL service
- Custom domain configuration available

### DigitalOcean App Platform
- Set environment variables in the app settings
- Use DigitalOcean Managed Database
- Custom domain configuration available

## 🔒 Security Considerations

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for AUTH_SECRET
3. **Enable HTTPS** in production
4. **Use environment-specific database credentials**
5. **Regularly rotate secrets** and update them

## 🐛 Troubleshooting

### Common Issues

1. **Authentication not working**: Check that `AUTH_URL` matches your domain
2. **Email not sending**: Verify SMTP credentials and test connection
3. **Database connection errors**: Check `DATABASE_URL` format and credentials
4. **CORS issues**: Ensure `NEXT_PUBLIC_APP_URL` is set correctly

### Debug Steps

1. Check environment variables are loaded correctly
2. Verify database connection
3. Test email functionality
4. Check browser console for errors
5. Review server logs

## 📞 Support

If you encounter issues during deployment, check:
1. This deployment guide
2. Platform-specific documentation
3. Environment variable configuration
4. Database and email service setup

---

**Note**: This application uses environment variables for all URL configurations, making deployment to any platform straightforward. Simply update the environment variables to match your production domain and you're ready to go!
