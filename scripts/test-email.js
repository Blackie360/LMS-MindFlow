#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * 
 * This script tests your email configuration to ensure emails can be sent.
 * Run it with: node scripts/test-email.js
 */

import { testEmailConnection } from '../lib/email-service.js'
import { validateEmailConfig } from '../lib/email-config.js'
import { getProviderEnvVars } from '../lib/email-config.js'

console.log('🧪 Testing MindFlow LMS Email Configuration\n')

// Check environment variables
console.log('📋 Checking environment variables...')
const isValid = validateEmailConfig()
if (!isValid) {
  console.log('❌ Email configuration is incomplete')
  console.log('\nRequired environment variables:')
  console.log('- EMAIL_SERVER_USER')
  console.log('- EMAIL_SERVER_PASSWORD') 
  console.log('- EMAIL_FROM')
  
  console.log('\n💡 Example configuration for Gmail:')
  const gmailVars = getProviderEnvVars('gmail')
  Object.entries(gmailVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`)
  })
  
  process.exit(1)
}

console.log('✅ Environment variables are configured')

// Test email connection
console.log('\n🔌 Testing email connection...')
try {
  const isConnected = await testEmailConnection()
  if (isConnected) {
    console.log('✅ Email connection successful!')
    console.log('🎉 Your email configuration is working correctly.')
    console.log('\nYou can now:')
    console.log('- Send email verification emails')
    console.log('- Send password reset emails')
    console.log('- Send welcome emails')
  } else {
    console.log('❌ Email connection failed')
    console.log('Please check your email provider settings and credentials.')
  }
} catch (error) {
  console.log('❌ Email connection error:', error.message)
  console.log('\n🔧 Troubleshooting tips:')
  console.log('1. Verify your email credentials')
  console.log('2. Check if your email provider requires App Passwords')
  console.log('3. Ensure your email account allows SMTP access')
  console.log('4. Check firewall and network settings')
}

console.log('\n📚 For more help, see EMAIL_SETUP.md')
