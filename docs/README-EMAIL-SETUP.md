# Email Setup for MindFlow Invitation System

This document explains how to set up the email functionality for the organization invitation system.

## Prerequisites

- Node.js 18+ and pnpm installed
- A Gmail account (or other SMTP provider)
- Environment variables configured

## Installation

The required packages are already installed:
- `nodemailer` - For sending emails
- `@react-email/components` - For creating beautiful email templates
- `react-email` - For rendering email templates

## Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```bash
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

## Email Templates

The system uses React Email templates located in the `emails/` directory:

- `organization-invitation.tsx` - Beautiful invitation email template
- Styled with modern design matching the app theme
- Responsive and accessible

## How It Works

1. **Invitation Creation**: When an organization admin creates an invitation
2. **Email Sending**: The system automatically sends a beautiful email using the template
3. **Email Rendering**: React Email renders the template to HTML
4. **SMTP Delivery**: Nodemailer sends the email via SMTP

## API Endpoints

- `POST /api/auth/organization/[id]/invitation` - Create invitation and send email
- `GET /api/auth/invitation/[token]` - Get invitation details
- `POST /api/auth/invitation/[token]/accept` - Accept invitation

## Testing

You can test the email functionality by:

1. Setting up environment variables
2. Creating an organization invitation
3. Checking your email inbox
4. Using the invitation link to accept

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check your SMTP credentials and app password
2. **Email Not Sending**: Verify SMTP settings and firewall rules
3. **Template Rendering**: Ensure React Email components are properly imported

### Debug Mode

Enable debug logging by adding to your environment:
```bash
DEBUG=nodemailer:*
```

## Security Considerations

- Never commit `.env` files to version control
- Use app passwords instead of account passwords
- Consider using environment-specific SMTP providers for production
- Implement rate limiting for invitation creation

## Production Deployment

For production, consider:
- Using a dedicated email service (SendGrid, Mailgun, etc.)
- Setting up proper SPF/DKIM records
- Implementing email verification
- Adding email templates for different languages
