# Email Setup Configuration

## Environment Variables

To enable email functionality for invitations, you need to set the following environment variables in your `.env.local` file:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=felixkent360@gmail.com
SMTP_PASSWORD=cpvh yrir arbk dfyp
EMAIL_FROM=felixkent360@gmail.com

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mindflow"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
   - Use this password in the `SMTP_PASSWORD` variable

## Testing Email Functionality

1. Start your development server: `npm run dev`
2. Create an organization as a super user
3. Use the member management to invite users
4. Check the console for email sending logs
5. Verify emails are received by invited users

## Email Templates

The system includes two email templates:

1. **Organization Invitation**: Sent when inviting users to join an organization
2. **Course Enrollment**: Sent when enrolling students in courses

Both templates use responsive HTML design and include:
- Branded headers with MindFlow styling
- Clear call-to-action buttons
- Role-specific information
- Expiration warnings

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check your Gmail app password
2. **Connection Refused**: Verify SMTP settings and port
3. **Emails Not Sending**: Check console logs for error details
4. **Spam Filtering**: Ensure proper SPF/DKIM records for production

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test SMTP connection manually
4. Check email service logs
