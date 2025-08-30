import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    // Map Better Auth fields to your existing schema
    user: {
      id: "id",
      email: "email",
      name: "name",
      image: "image",
      emailVerified: "emailVerified",
      role: "role",
    },
    account: {
      id: "id",
      userId: "userId",
      providerId: "providerId",
      accountId: "accountId",
      accessToken: "accessToken",
      accessTokenExpiresAt: "accessTokenExpiresAt",
      refreshToken: "refreshToken",
      refreshTokenExpiresAt: "refreshTokenExpiresAt",
      idToken: "idToken",
      scope: "scope",
      password: "password",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    session: {
      id: "id",
      userId: "userId",
      token: "token",
      expiresAt: "expiresAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      ipAddress: "ipAddress",
      userAgent: "userAgent",
    },
    verification: {
      id: "id",
      identifier: "identifier",
      value: "value",
      expiresAt: "expiresAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // TODO: Implement email sending logic
      console.log(`Verification email for ${user.email}: ${url}`);
    },
  },
  organization: {
    // Custom fields for school-specific data
    additionalFields: {
      schoolCode: { type: "string", required: false },
      departmentCode: { type: "string", required: false },
      subscriptionTier: { type: "string", required: false, default: "basic" },
      maxTeams: { type: "number", required: false, default: 5 },
      maxMembersPerTeam: { type: "number", required: false, default: 50 },
      branding: {
        type: "object",
        required: false,
        properties: {
          logo: { type: "string" },
          primaryColor: { type: "string" },
          secondaryColor: { type: "string" },
        },
      },
    },
    // Restrict organization creation to admins only
    allowUserToCreateOrganization: async (user) => {
      return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    },
    // Hooks for organization lifecycle
    organizationCreation: {
      beforeCreate: async (data, user) => {
        // Set metadata for school type
        return {
          ...data,
          metadata: {
            type: "school",
            createdBy: user.id,
            createdAt: new Date().toISOString(),
          },
        };
      },
      afterCreate: async (organization, user) => {
        try {
          // Create default "General" team
          await prisma.team.create({
            data: {
              id: `team_${organization.id}_general`,
              name: "General",
              slug: "general",
              organizationId: organization.id,
              description: "Default team for general courses and activities",
              createdBy: user.id,
              metadata: {
                type: "default",
                isDefault: true,
              },
            },
          });

          console.log(`Initialized default resources for organization: ${organization.id}`);
        } catch (error) {
          console.error("Error initializing default resources:", error);
        }
      },
    },
    // Team configuration
    team: {
      additionalFields: {
        departmentCode: { type: "string", required: false },
        maxMembers: { type: "number", required: false, default: 50 },
        category: { type: "string", required: false },
        description: { type: "string", required: false },
      },
      // Limit team creation based on subscription tier
      beforeCreate: async (data, user, organization) => {
        const existingTeams = await prisma.team.count({
          where: { organizationId: organization.id },
        });

        if (existingTeams >= organization.maxTeams) {
          throw new Error("Maximum number of teams reached for this subscription tier");
        }

        return data;
      },
    },
    // Member management
    member: {
      additionalFields: {
        department: { type: "string", required: false },
        grade: { type: "string", required: false },
        enrollmentDate: { type: "date", required: false },
        status: { type: "string", required: false, default: "active" },
      },
      // Limit team members based on subscription
      beforeCreate: async (data, user, organization, team) => {
        const existingMembers = await prisma.organizationMember.count({
          where: { organizationId: organization.id, teamId: team.id },
        });

        if (existingMembers >= organization.maxMembersPerTeam) {
          throw new Error("Maximum number of team members reached");
        }

        return {
          ...data,
          enrollmentDate: new Date().toISOString(),
          status: "active",
        };
      },
    },
    // Invitation system
    invitation: {
      additionalFields: {
        department: { type: "string", required: false },
        teamId: { type: "string", required: false },
        expiresIn: { type: "number", required: false, default: 7 }, // days
      },
      // Send invitation emails
      sendInvitationEmail: async ({ invitation, organization, inviter }) => {
        // TODO: Implement email sending logic
        console.log(`Sending invitation email to ${invitation.email} for organization ${organization.name}`);
        
        // You can integrate with your email service here
        // Example: await sendEmail({
        //   to: invitation.email,
        //   subject: `You're invited to join ${organization.name}`,
        //   template: 'invitation',
        //   data: { invitation, organization, inviter }
        // });
      },
      // Require email verification before accepting invitations
      requireEmailVerification: true,
    },
  },
});
