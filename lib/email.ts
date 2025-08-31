import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'felixkent360@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'cpvh yrir arbk dfyp',
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || 'felixkent360@gmail.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Email templates
export function generateInvitationEmail(
  inviterName: string,
  organizationName: string,
  role: string,
  invitationUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're Invited to Join ${organizationName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 You're Invited!</h1>
          <p>Join ${organizationName} on MindFlow</p>
        </div>
        <div class="content">
          <h2>Hello there!</h2>
          <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on MindFlow as a <strong>${role}</strong>.</p>
          
          <p>MindFlow is a powerful learning management system that helps educators and students create engaging learning experiences.</p>
          
          <div style="text-align: center;">
            <a href="${invitationUrl}" class="button">Accept Invitation</a>
          </div>
          
          <p><strong>What you'll be able to do:</strong></p>
          <ul>
            ${role === 'instructor' ? '<li>Create and manage courses</li><li>Enroll students</li><li>Track learning progress</li>' : ''}
            ${role === 'student' ? '<li>Access course content</li><li>Track your progress</li><li>Engage with learning materials</li>' : ''}
          </ul>
          
          <p><strong>Important:</strong> This invitation will expire in 7 days. If you have any questions, please contact ${inviterName}.</p>
        </div>
        <div class="footer">
          <p>This invitation was sent from MindFlow Learning Management System</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateCourseEnrollmentEmail(
  instructorName: string,
  courseName: string,
  organizationName: string,
  enrollmentUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're Enrolled in ${courseName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 Course Enrollment</h1>
          <p>Welcome to ${courseName}</p>
        </div>
        <div class="content">
          <h2>Congratulations!</h2>
          <p><strong>${instructorName}</strong> has enrolled you in <strong>${courseName}</strong> at <strong>${organizationName}</strong>.</p>
          
          <p>You now have access to all course materials, lessons, and learning resources.</p>
          
          <div style="text-align: center;">
            <a href="${enrollmentUrl}" class="button">Start Learning</a>
          </div>
          
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Review the course syllabus</li>
            <li>Complete your first lesson</li>
            <li>Track your progress</li>
            <li>Engage with course materials</li>
          </ul>
          
          <p>If you have any questions about the course, please contact your instructor.</p>
        </div>
        <div class="footer">
          <p>This enrollment was processed through MindFlow Learning Management System</p>
          <p>Happy learning!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
