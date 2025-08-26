# MindFlow LMS Email Setup Guide

This guide will help you configure Nodemailer to send email verification and password reset emails for your MindFlow LMS.

## Prerequisites

- Node.js 18+ installed
- Nodemailer package installed (`pnpm add nodemailer @types/nodemailer`)
- Access to an email account or email service

## Quick Setup

### 1. Basic Environment Variables

Create a `.env.local` file in your project root and add these variables:

```env
# Email Configuration
EMAIL_PROVIDER=gmail
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Better Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

### 2. Test Email Configuration

Run this command to test your email setup:

```bash
pnpm tsx -e "
import { testEmailConnection } from './lib/email-service'
testEmailConnection().then(console.log)
"
```

## Email Provider Configurations

### Gmail (Recommended for Development)

**Setup Steps:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password (not your regular Gmail password)

**Environment Variables:**
```env
EMAIL_PROVIDER=gmail
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-16-digit-app-password
EMAIL_FROM=your-email@gmail.com
```

### Outlook/Hotmail

**Environment Variables:**
```env
EMAIL_PROVIDER=outlook
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@outlook.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
```

### Yahoo

**Setup Steps:**
1. Enable 2-Factor Authentication
2. Generate an App Password

**Environment Variables:**
```env
EMAIL_PROVIDER=yahoo
EMAIL_SERVER_HOST=smtp.mail.yahoo.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yahoo.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@yahoo.com
```

### Custom SMTP Server

**Environment Variables:**
```env
EMAIL_PROVIDER=custom
EMAIL_SERVER_HOST=smtp.yourdomain.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=noreply@yourdomain.com
```

### SendGrid (Production Recommended)

**Setup Steps:**
1. Create a SendGrid account
2. Verify your sender domain
3. Generate an API key

**Environment Variables:**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=verified-sender@yourdomain.com
```

### Mailgun

**Environment Variables:**
```env
EMAIL_PROVIDER=mailgun
MAILGUN_USER=your-mailgun-user
MAILGUN_PASSWORD=your-mailgun-password
EMAIL_FROM=verified-sender@yourdomain.com
```

## Advanced Configuration

### Custom Email Templates

You can customize email templates by modifying `lib/email-service.ts`:

```typescript
// Custom verification email template
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

### Email Validation

The system automatically validates email configuration:

```typescript
import { validateEmailConfig } from './lib/email-config'

// Check if email is properly configured
if (!validateEmailConfig()) {
  console.warn('Email configuration incomplete')
}
```

### Testing Email Connection

Test your email setup programmatically:

```typescript
import { testEmailConnection } from './lib/email-service'

// Test email connection
const isConnected = await testEmailConnection()
if (isConnected) {
  console.log('Email service is working!')
} else {
  console.log('Email service configuration error')
}
```

## Troubleshooting

### Common Issues

#### 1. "Invalid login" Error
- **Gmail**: Use App Password, not regular password
- **Yahoo**: Use App Password, not regular password
- **Outlook**: Ensure 2FA is disabled or use App Password

#### 2. "Connection timeout" Error
- Check firewall settings
- Verify port numbers (587 for TLS, 465 for SSL)
- Try different ports if available

#### 3. "Authentication failed" Error
- Verify username and password
- Check if email provider requires special authentication
- Ensure account is not locked or suspended

#### 4. "Relay access denied" Error
- Email provider doesn't allow SMTP relay
- Use a different email provider
- Contact your email provider for SMTP access

### Debug Mode

Enable detailed logging:

```env
DEBUG=nodemailer:*
NODE_ENV=development
```

### Testing with Different Providers

Switch between providers easily:

```env
# Test Gmail
EMAIL_PROVIDER=gmail

# Test Outlook
EMAIL_PROVIDER=outlook

# Test custom SMTP
EMAIL_PROVIDER=custom
```

## Production Considerations

### Security
- Use environment variables for sensitive data
- Never commit `.env` files to version control
- Use strong, unique passwords for email accounts
- Consider using dedicated email service accounts

### Reliability
- Use professional email services (SendGrid, Mailgun) for production
- Implement email queuing for high-volume applications
- Set up email monitoring and alerts
- Have fallback email providers

### Performance
- Use connection pooling for high-volume sending
- Implement rate limiting to avoid being flagged as spam
- Monitor email delivery rates and bounce rates

## Email Templates

The system includes three email templates:

1. **Verification Email**: Sent when users register
2. **Password Reset Email**: Sent when users request password reset
3. **Welcome Email**: Sent after email verification

### Template Features
- Responsive HTML design
- Plain text fallback
- Professional styling
- Clear call-to-action buttons
- Security warnings and information

## Next Steps

1. **Choose your email provider** based on your needs
2. **Set up environment variables** following the examples above
3. **Test your configuration** using the test function
4. **Customize email templates** if needed
5. **Deploy and monitor** email delivery

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your email provider's SMTP settings
3. Test with a simple email client first
4. Check the console logs for detailed error messages
5. Ensure all environment variables are set correctly

## Example Complete Configuration

Here's a complete example for Gmail:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mindflow_lms"

# Better Auth
BETTER_AUTH_SECRET="your-32-character-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Email Configuration (Gmail)
EMAIL_PROVIDER=gmail
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=abcd-efgh-ijkl-mnop
EMAIL_FROM=your-email@gmail.com

# Environment
NODE_ENV=development
```

Replace the placeholder values with your actual configuration and you'll be ready to send emails!
