// Email configuration utility for different providers
export const emailProviders = {
  // Gmail configuration
  gmail: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD, // Use App Password, not regular password
    },
  },

  // Outlook/Hotmail configuration
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  },

  // Yahoo configuration
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  },

  // Custom SMTP server
  custom: {
    host: process.env.EMAIL_SERVER_HOST || 'smtp.yourdomain.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_PORT === '465',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  },

  // SendGrid configuration
  sendgrid: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey', // SendGrid requires 'apikey' as username
      pass: process.env.SENDGRID_API_KEY,
    },
  },

  // Mailgun configuration
  mailgun: {
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAILGUN_USER,
      pass: process.env.MAILGUN_PASSWORD,
    },
  },
}

// Get email configuration based on provider
export function getEmailConfig(provider: keyof typeof emailProviders = 'gmail') {
  return emailProviders[provider]
}

// Validate email configuration
export function validateEmailConfig() {
  const requiredVars = [
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_HOST'
  ]

  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing email environment variables: ${missing.join(', ')}`)
    console.warn('Email functionality will not work without these variables')
    return false
  }

  return true
}

// Test email configuration
export async function testEmailConnection(provider: keyof typeof emailProviders = 'gmail') {
  const nodemailer = await import('nodemailer')
  const config = getEmailConfig(provider)
  
  try {
    const transporter = nodemailer.createTransport(config)
    await transporter.verify()
    console.log('✅ Email configuration is valid')
    return true
  } catch (error) {
    console.error('❌ Email configuration error:', error)
    return false
  }
}

// Get recommended environment variables for a provider
export function getProviderEnvVars(provider: keyof typeof emailProviders) {
  const baseVars = {
    EMAIL_FROM: 'noreply@yourdomain.com',
  }

  switch (provider) {
    case 'gmail':
      return {
        ...baseVars,
        EMAIL_SERVER_HOST: 'smtp.gmail.com',
        EMAIL_SERVER_PORT: '587',
        EMAIL_SERVER_USER: 'your-email@gmail.com',
        EMAIL_SERVER_PASSWORD: 'your-app-password', // Use App Password, not regular password
      }
    
    case 'outlook':
      return {
        ...baseVars,
        EMAIL_SERVER_HOST: 'smtp-mail.outlook.com',
        EMAIL_SERVER_PORT: '587',
        EMAIL_SERVER_USER: 'your-email@outlook.com',
        EMAIL_SERVER_PASSWORD: 'your-password',
      }
    
    case 'yahoo':
      return {
        ...baseVars,
        EMAIL_SERVER_HOST: 'smtp.mail.yahoo.com',
        EMAIL_SERVER_PORT: '587',
        EMAIL_SERVER_USER: 'your-email@yahoo.com',
        EMAIL_SERVER_PASSWORD: 'your-app-password',
      }
    
    case 'sendgrid':
      return {
        ...baseVars,
        EMAIL_SERVER_HOST: 'smtp.sendgrid.net',
        EMAIL_SERVER_PORT: '587',
        EMAIL_SERVER_USER: 'apikey',
        EMAIL_SERVER_PASSWORD: 'your-sendgrid-api-key',
      }
    
    case 'mailgun':
      return {
        ...baseVars,
        EMAIL_SERVER_HOST: 'smtp.mailgun.org',
        EMAIL_SERVER_PORT: '587',
        EMAIL_SERVER_USER: 'your-mailgun-user',
        EMAIL_SERVER_PASSWORD: 'your-mailgun-password',
      }
    
    case 'custom':
      return {
        ...baseVars,
        EMAIL_SERVER_HOST: 'smtp.yourdomain.com',
        EMAIL_SERVER_PORT: '587',
        EMAIL_SERVER_USER: 'your-email@yourdomain.com',
        EMAIL_SERVER_PASSWORD: 'your-password',
      }
    
    default:
      return baseVars
  }
}
