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
      // Map the role field from your schema
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
});
