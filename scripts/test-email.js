const nodemailer = require('nodemailer');

// Test email configuration
const testConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'test-password',
  },
};

async function testEmailConnection() {
  try {
    console.log('Testing email connection...');
    
    // Create transporter
    const transporter = nodemailer.createTransport(testConfig);
    
    // Verify connection
    await transporter.verify();
    console.log('✅ Email connection successful!');
    
    // Test sending a simple email
    const info = await transporter.sendMail({
      from: `"MindFlow Test" <${testConfig.auth.user}>`,
      to: 'test@example.com',
      subject: 'Test Email from MindFlow',
      html: '<h1>Test Email</h1><p>This is a test email to verify the email system is working.</p>',
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('1. SMTP_USER and SMTP_PASS environment variables');
      console.log('2. Gmail app password is correct');
      console.log('3. 2-factor authentication is enabled');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Please check:');
      console.log('1. SMTP_HOST and SMTP_PORT are correct');
      console.log('2. Firewall settings allow SMTP connections');
    }
  }
}

// Run the test
testEmailConnection();
