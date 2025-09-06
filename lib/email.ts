import { render } from "@react-email/components";
import nodemailer from "nodemailer";
import type * as React from "react";
import { OrganizationInvitationEmail } from "@/emails/organization-invitation";

// Create a transporter using environment variables
const createTransporter = () => {
  // Check if required environment variables are set
  if (
    !process.env.SMTP_USER ||
    (!process.env.SMTP_PASS && !process.env.SMTP_PASSWORD)
  ) {
    throw new Error(
      "SMTP_USER and SMTP_PASS/SMTP_PASSWORD environment variables are required",
    );
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
    },
  });
};

export interface SendInvitationEmailParams {
  to: string;
  organizationName: string;
  inviterName: string;
  role: string;
  department?: string;
  invitationUrl: string;
  expiresIn: number;
}

export const sendInvitationEmail = async (
  params: SendInvitationEmailParams,
) => {
  try {
    console.log("📧 Creating email transporter...");
    const transporter = createTransporter();
    console.log("✅ Transporter created successfully");

    console.log("🎨 Rendering email template...");
    const emailHtml = await render(
      OrganizationInvitationEmail(params) as React.ReactElement,
    );
    console.log("✅ Email template rendered successfully");

    console.log("📤 Sending email...");
    const info = await transporter.sendMail({
      from: `"MindFlow" <${process.env.SMTP_USER}>`,
      to: params.to,
      subject: `You're invited to join ${params.organizationName} on MindFlow`,
      html: emailHtml,
    });

    console.log("✅ Invitation email sent successfully!");
    console.log("📨 Message ID:", info.messageId);
    console.log("📧 To:", params.to);
    console.log("🏢 Organization:", params.organizationName);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send invitation email:", error);
    if (error instanceof Error) {
      console.error("🔍 Error details:", {
        message: error.message,
        code: (error as { code?: string }).code,
        stack: error.stack,
      });
    }
    throw new Error("Failed to send invitation email");
  }
};

export interface SendOrganizationInvitationParams {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  organizationName: string;
  inviteLink: string;
}

export const sendOrganizationInvitation = async (
  params: SendOrganizationInvitationParams,
) => {
  try {
    console.log("📧 Creating email transporter for organization invitation...");
    const transporter = createTransporter();
    console.log("✅ Transporter created successfully");

    console.log("🎨 Rendering organization invitation email template...");
    const emailHtml = await render(
      OrganizationInvitationEmail({
        organizationName: params.organizationName,
        inviterName: params.invitedByUsername,
        role: "member", // Default role for organization invitations
        invitationUrl: params.inviteLink,
        expiresIn: 7, // 7 days
      }) as React.ReactElement,
    );
    console.log("✅ Email template rendered successfully");

    console.log("📤 Sending organization invitation email...");
    const info = await transporter.sendMail({
      from: `"MindFlow" <${process.env.SMTP_USER}>`,
      to: params.email,
      subject: `You're invited to join ${params.organizationName} on MindFlow`,
      html: emailHtml,
    });

    console.log("✅ Organization invitation email sent successfully!");
    console.log("📨 Message ID:", info.messageId);
    console.log("📧 To:", params.email);
    console.log("🏢 Organization:", params.organizationName);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send organization invitation email:", error);
    if (error instanceof Error) {
      console.error("🔍 Error details:", {
        message: error.message,
        code: (error as { code?: string }).code,
        stack: error.stack,
      });
    }
    throw new Error("Failed to send organization invitation email");
  }
};

export const sendTestEmail = async (to: string) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"MindFlow" <${process.env.SMTP_USER}>`,
      to,
      subject: "Test Email from MindFlow",
      html: "<h1>Test Email</h1><p>This is a test email from MindFlow.</p>",
    });

    console.log("Test email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send test email:", error);
    throw new Error("Failed to send test email");
  }
};
