import { betterAuth } from "better-auth"
import { Pool } from "pg"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"
import { sendEmail, emailTemplates } from "./email-service"

// Create Prisma client
const prisma = new PrismaClient()

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Email verification is required for new accounts
    requireEmailVerification: true,
    // Send verification email using Nodemailer
    sendVerificationEmail: async ({ user, url, token }: any, request: any) => {
      try {
        const verificationEmail = emailTemplates.verificationEmail(
          user.name || 'User',
          url
        )
        
        const success = await sendEmail({
          to: user.email,
          subject: verificationEmail.subject,
          html: verificationEmail.html,
          text: verificationEmail.text,
        })
        
        if (success) {
          console.log(`Verification email sent successfully to ${user.email}`)
        } else {
          console.error(`Failed to send verification email to ${user.email}`)
        }
      } catch (error) {
        console.error('Error sending verification email:', error)
      }
    },
    // Send password reset email using Nodemailer
    sendResetPassword: async ({ user, url, token }: any, request: any) => {
      try {
        const resetEmail = emailTemplates.passwordResetEmail(
          user.name || 'User',
          url
        )
        
        const success = await sendEmail({
          to: user.email,
          subject: resetEmail.subject,
          html: resetEmail.html,
          text: resetEmail.text,
        })
        
        if (success) {
          console.log(`Password reset email sent successfully to ${user.email}`)
        } else {
          console.error(`Failed to send password reset email to ${user.email}`)
        }
      } catch (error) {
        console.error('Error sending password reset email:', error)
      }
    },
    // Handle password reset
    onPasswordReset: async ({ user }: any, request: any) => {
      console.log(`Password reset for user ${user.email}`)
      
      // Optionally send a confirmation email
      try {
        const welcomeEmail = emailTemplates.welcomeEmail(
          user.name || 'User',
          `${process.env.BETTER_AUTH_URL}/dashboard`
        )
        
        await sendEmail({
          to: user.email,
          subject: welcomeEmail.subject,
          html: welcomeEmail.html,
          text: welcomeEmail.text,
        })
      } catch (error) {
        console.error('Error sending welcome email after password reset:', error)
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  // Add custom user fields for role management
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false, // Make it not required initially
        default: "STUDENT",
        validate: (value: string) => {
          return ["STUDENT", "INSTRUCTOR", "ADMIN"].includes(value)
        }
      },
      emailVerified: {
        type: "boolean",
        required: true,
        default: false
      }
    }
  },
  // Add callbacks for custom logic
  callbacks: {
    // Customize user creation
    onUserCreate: async ({ user, account }: any, request: any) => {
      console.log("onUserCreate called with:", { user, account })
      
      // Set default role to STUDENT unless specified
      if (!user.role) {
        console.log("Setting default role to STUDENT")
        user.role = "STUDENT"
      } else {
        console.log("User already has role:", user.role)
      }
      
      // Set email verification status
      user.emailVerified = false
      
      console.log("Final user object:", user)
      return user
    },
    // Customize session
    onSessionCreate: async ({ session, user }: any, request: any) => {
      // Add user role to session
      session.user.role = user.role
      session.user.emailVerified = user.emailVerified
      
      return session
    }
  }
})

// Export the auth configuration for the API route
export { auth }