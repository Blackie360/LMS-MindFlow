require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

console.log('🔍 Testing SMTP Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASSWORD ? 'SET (hidden)' : 'NOT SET');
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? 'SET (hidden)' : 'NOT SET');
console.log('');

// Create transporter
const createTransporter = () => {
  if (!process.env.SMTP_USER || (!process.env.SMTP_PASS && !process.env.SMTP_PASSWORD)) {
    throw new Error('SMTP_USER and SMTP_PASS/SMTP_PASSWORD environment variables are required');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
    },
  });
};

async function testEmailConnection() {
  try {
    console.log('📧 Testing email connection...');
    
    // Create transporter
    const transporter = createTransporter();
    
    // Verify connection
    await transporter.verify();
    console.log('✅ Email connection successful!');
    
    // Test sending a simple email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"MindFlow Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'Test Email from MindFlow',
      html: `
        <h1>🎉 Test Email Successful!</h1>
        <p>This is a test email to verify your MindFlow email configuration is working.</p>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Host: ${process.env.SMTP_HOST}</li>
          <li>Port: ${process.env.SMTP_PORT}</li>
          <li>User: ${process.env.SMTP_USER}</li>
          <li>Secure: ${process.env.SMTP_SECURE}</li>
        </ul>
        <p>Your email system is now ready to send invitation emails!</p>
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('1. SMTP_USER and SMTP_PASSWORD environment variables');
      console.log('2. Gmail app password is correct');
      console.log('3. 2-factor authentication is enabled');
      console.log('4. Less secure app access is enabled (if using Gmail)');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Please check:');
      console.log('1. SMTP_HOST and SMTP_PORT are correct');
      console.log('2. Firewall settings allow SMTP connections');
      console.log('3. Network connectivity to the SMTP server');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Host not found. Please check:');
      console.log('1. SMTP_HOST is correct');
      console.log('2. DNS resolution is working');
    }
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your .env file has the correct SMTP settings');
    console.log('2. Check if your email provider requires specific settings');
    console.log('3. Test with a different email client to verify credentials');
  }
}

// Run the test
testEmailConnection();
