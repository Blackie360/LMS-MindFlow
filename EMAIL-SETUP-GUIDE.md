# 📧 MindFlow Email Setup Guide

This guide will help you set up and troubleshoot the email system for sending organization invitations.

## 🚀 **Quick Setup**

### **1. Test Your Current Configuration**
```bash
pnpm test:email-config
```

This will test your SMTP settings and send a test email to verify everything works.

### **2. If Email Fails - Common Issues & Solutions**

## 🔧 **Gmail Setup (Recommended)**

### **Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"

### **Step 2: Generate App Password**
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (Custom name)"
3. Name it "MindFlow LMS"
4. Copy the generated 16-character password

### **Step 3: Update Environment Variables**
```bash
# In your .env file
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

## 📧 **Other Email Providers**

### **Outlook/Hotmail**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### **Yahoo**
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

### **Custom SMTP Server**
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
```

## 🧪 **Testing & Troubleshooting**

### **Test Email Configuration**
```bash
pnpm test:email-config
```

### **Test Email Sending**
```bash
pnpm test:email
```

### **Common Error Codes**

#### **EAUTH - Authentication Failed**
- ❌ Wrong password
- ❌ 2FA not enabled
- ❌ App password not generated
- ❌ Username incorrect

**Solutions:**
1. Verify your email and password
2. Enable 2-factor authentication
3. Generate a new app password
4. Check for typos

#### **ECONNECTION - Connection Failed**
- ❌ Firewall blocking SMTP
- ❌ Wrong port number
- ❌ Network connectivity issues

**Solutions:**
1. Check firewall settings
2. Verify port number (587 for TLS, 465 for SSL)
3. Test network connectivity

#### **ENOTFOUND - Host Not Found**
- ❌ Wrong SMTP host
- ❌ DNS resolution issues

**Solutions:**
1. Verify SMTP host is correct
2. Check DNS settings

## 🔍 **Debug Mode**

Enable detailed logging by adding to your environment:
```bash
DEBUG=nodemailer:*
```

## 📱 **Mobile/App Access**

### **Gmail App Password Requirements**
- Must be 16 characters
- Generated specifically for "Mail"
- Cannot use regular account password
- Works with any email client

### **Security Best Practices**
- ✅ Use app passwords instead of account passwords
- ✅ Enable 2-factor authentication
- ✅ Regularly rotate app passwords
- ✅ Never commit passwords to version control

## 🚨 **Production Considerations**

### **Email Service Providers**
For production, consider using dedicated email services:
- **SendGrid** - High deliverability, analytics
- **Mailgun** - Developer-friendly, good pricing
- **Amazon SES** - Cost-effective, AWS integration
- **Postmark** - Transactional email specialist

### **Environment-Specific Configuration**
```bash
# Development
SMTP_HOST=smtp.gmail.com
SMTP_USER=dev@yourcompany.com

# Production
SMTP_HOST=api.sendgrid.com
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

## 📋 **Complete Environment Template**

```bash
# Database
DATABASE_URL="your-database-url"

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth Configuration
AUTH_SECRET=your-auth-secret
AUTH_URL=http://localhost:3000
```

## 🎯 **Verification Checklist**

- [ ] Environment variables set correctly
- [ ] 2FA enabled on email account
- [ ] App password generated
- [ ] Test email sent successfully
- [ ] Invitation emails working
- [ ] Error handling working properly

## 🆘 **Still Having Issues?**

### **1. Check Logs**
Look for error messages in your console/terminal

### **2. Verify Environment**
```bash
cat .env | grep SMTP
```

### **3. Test Connection**
```bash
telnet smtp.gmail.com 587
```

### **4. Check Firewall**
Ensure port 587 (or 465) is not blocked

### **5. Network Issues**
Try from different network or use VPN

## 📞 **Support**

If you're still experiencing issues:
1. Run `pnpm test:email-config` and share the output
2. Check the browser console for errors
3. Verify your environment variables
4. Test with a different email client

---

**Remember:** The email system is designed to gracefully handle failures. Invitations will still be created even if emails fail to send, ensuring your system remains functional.
