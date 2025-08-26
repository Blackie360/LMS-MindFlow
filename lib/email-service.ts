import nodemailer from 'nodemailer'
import { getEmailConfig, validateEmailConfig } from './email-config'

// Email content interface
interface EmailContent {
  to: string
  subject: string
  html: string
  text?: string
}

// Create transporter based on environment
function createTransporter() {
  // Validate email configuration first
  if (!validateEmailConfig()) {
    throw new Error('Email configuration is incomplete. Please check your environment variables.')
  }

  // Get email configuration (defaults to gmail)
  const emailProvider = process.env.EMAIL_PROVIDER as keyof typeof import('./email-config').emailProviders || 'gmail'
  const config = getEmailConfig(emailProvider)

  return nodemailer.createTransport(config)
}

// Send email function
async function sendEmail(content: EmailContent): Promise<boolean> {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: content.to,
      subject: content.subject,
      html: content.html,
      text: content.text || content.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Test email connection
async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log('✅ Email connection test successful')
    return true
  } catch (error) {
    console.error('❌ Email connection test failed:', error)
    return false
  }
}

// Email templates
const emailTemplates = {
  // Email verification template
  verificationEmail: (userName: string, verificationUrl: string) => ({
    subject: 'Verify your MindFlow account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your MindFlow account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 MindFlow LMS</h1>
            <p>Welcome to your learning journey!</p>
          </div>
          <div class="content">
            <h2>Hello ${userName || 'there'}!</h2>
            <p>Thank you for creating your MindFlow account. To get started with your learning experience, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification email.
            </div>
            
            <p>If you didn't create this account, you can safely ignore this email.</p>
            
            <p>Best regards,<br>The MindFlow Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} MindFlow LMS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to MindFlow LMS!
      
      Hello ${userName || 'there'}!
      
      Thank you for creating your MindFlow account. To get started with your learning experience, please verify your email address by visiting this link:
      
      ${verificationUrl}
      
      Important: This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification email.
      
      If you didn't create this account, you can safely ignore this email.
      
      Best regards,
      The MindFlow Team
      
      This is an automated email. Please do not reply to this message.
    `
  }),

  // Password reset template
  passwordResetEmail: (userName: string, resetUrl: string) => ({
    subject: 'Reset your MindFlow password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your MindFlow password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .urgent { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 MindFlow LMS</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hello ${userName || 'there'}!</h2>
            <p>We received a request to reset your MindFlow account password. To proceed with the password reset, click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour for security reasons.
            </div>
            
            <div class="urgent">
              <strong>🚨 Security Notice:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure. Your password will remain unchanged.
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>The MindFlow Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} MindFlow LMS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      MindFlow LMS - Password Reset Request
      
      Hello ${userName || 'there'}!
      
      We received a request to reset your MindFlow account password. To proceed with the password reset, visit this link:
      
      ${resetUrl}
      
      Important: This password reset link will expire in 1 hour for security reasons.
      
      Security Notice: If you didn't request this password reset, please ignore this email and ensure your account is secure. Your password will remain unchanged.
      
      If you have any questions or need assistance, please contact our support team.
      
      Best regards,
      The MindFlow Team
      
      This is an automated email. Please do not reply to this message.
    `
  }),

  // Welcome email template (for after verification)
  welcomeEmail: (userName: string, dashboardUrl: string) => ({
    subject: 'Welcome to MindFlow - Your account is verified!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MindFlow!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 MindFlow LMS</h1>
            <p>Welcome aboard!</p>
          </div>
          <div class="content">
            <div class="success">
              <strong>✅ Success!</strong> Your email has been verified and your account is now active.
            </div>
            
            <h2>Hello ${userName || 'there'}!</h2>
            <p>Welcome to MindFlow! Your account has been successfully verified and you're now ready to start your learning journey.</p>
            
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            </div>
            
            <p>Here's what you can do next:</p>
            <ul>
              <li>Browse available courses</li>
              <li>Complete your profile</li>
              <li>Start learning at your own pace</li>
              <li>Connect with other learners</li>
            </ul>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <p>Happy learning!<br>The MindFlow Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} MindFlow LMS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to MindFlow LMS!
      
      Success! Your email has been verified and your account is now active.
      
      Hello ${userName || 'there'}!
      
      Welcome to MindFlow! Your account has been successfully verified and you're now ready to start your learning journey.
      
      Go to your dashboard: ${dashboardUrl}
      
      Here's what you can do next:
      - Browse available courses
      - Complete your profile
      - Start learning at your own pace
      - Connect with other learners
      
      If you have any questions or need help getting started, don't hesitate to reach out to our support team.
      
      Happy learning!
      The MindFlow Team
      
      This is an automated email. Please do not reply to this message.
    `
  })
}

// Export the email service
export { sendEmail, emailTemplates, testEmailConnection }
