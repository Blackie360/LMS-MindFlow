import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "./db";
import { sendOrganizationInvitation } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, _request) => {
      // TODO: Implement email sending logic
      console.log(`Verification email for ${user.email}: ${url}`);
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
      requireEmailVerificationOnInvitation: true,
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
      // Use additionalFields to include createdBy field
      schema: {
        organization: {
          additionalFields: {
            createdBy: {
              type: "string",
              required: true,
              input: true, // Allow input so we can set it manually
            },
          },
        },
      },
      
      // Teams configuration
      teams: {
        enabled: true,
        maximumTeams: 10,
        allowRemovingAllTeams: false,
      },
      // Dynamic access control
      dynamicAccessControl: {
        enabled: true,
        maximumRolesPerOrganization: 20,
      },
    }),
  ],
});

