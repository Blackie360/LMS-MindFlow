import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "./db";
import { sendOrganizationInvitation } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  secret: process.env.AUTH_SECRET,
  logger: {
    level: "debug",
    disabled: false,
  },
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, _request) => {
      // For now, just log the verification email
      // In production, you would send an actual email here
      console.log(`Verification email for ${user.email}: ${url}`);
      console.log(`Verification token: ${token}`);
      
      // For development/testing, we'll just log this
      // In production, integrate with your email service
    },
  },
  plugins: [
    organization({
      // Allow users to create organizations
      allowUserToCreateOrganization: true,
      // Set organization limits
      organizationLimit: 5,
      // Set membership limits
      membershipLimit: 100,
      // Set invitation limits
      invitationLimit: 100,
      // Invitation expiration (48 hours)
      invitationExpiresIn: 48 * 60 * 60, // 48 hours in seconds
      // Cancel pending invitations on re-invite
      cancelPendingInvitationsOnReInvite: false,
      // Require email verification for invitations
      requireEmailVerificationOnInvitation: false,
      // Send invitation email function
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/accept-invitation/${data.id}`;
        await sendOrganizationInvitation({
          email: data.email,
          invitedByUsername: data.inviter.user.name || 'Unknown',
          invitedByEmail: data.inviter.user.email,
          organizationName: data.organization.name,
          inviteLink,
        });
      },
    }),
  ],
});

