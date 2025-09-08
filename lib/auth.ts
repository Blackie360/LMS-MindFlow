import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          return null;
        }

        const userWithPassword = user as any;
        if (!userWithPassword.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          userWithPassword.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle invitation-based social auth
      if (account?.provider === 'google' || account?.provider === 'github') {
        // Check if there's a pending invitation for this email
        const invitation = await prisma.invitation.findFirst({
          where: {
            email: user.email!,
            status: 'pending',
            expiresAt: {
              gt: new Date()
            }
          },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        });

        if (invitation) {
          // Update user role based on invitation
          const userRole = invitation.role === 'instructor' || invitation.role === 'leadInstructor' 
            ? 'INSTRUCTOR' 
            : invitation.role === 'admin' || invitation.role === 'superAdmin'
            ? 'ADMIN'
            : 'STUDENT';

          // Update user with correct role
          await prisma.user.update({
            where: { email: user.email! },
            data: { role: userRole }
          });

          // Add user to organization
          await prisma.member.create({
            data: {
              organizationId: invitation.organization.id,
              userId: user.id!,
              role: invitation.role,
              department: invitation.department || null,
              status: 'active',
            }
          });

          // Mark invitation as accepted
          await prisma.invitation.update({
            where: { id: invitation.id },
            data: { acceptedAt: new Date() }
          });

          // Store invitation data in user object for redirect
          (user as any).invitationData = {
            organization: invitation.organization,
            role: userRole
          };
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        // Track the sign-in method
        if (account) {
          console.log("JWT Callback - OAuth sign-in method:", account.provider);
          token.signInMethod = account.provider;
        } else {
          console.log("JWT Callback - Credentials sign-in method");
          token.signInMethod = 'credentials';
        }

        // Store invitation data if available
        if ((user as any).invitationData) {
          token.invitationData = (user as any).invitationData;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.signInMethod = token.signInMethod as string;
        console.log("Session Callback - signInMethod:", token.signInMethod);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle invitation-based redirects
      if (url.includes('/auth/signin') && url.includes('invitation')) {
        return url;
      }
      
      // Default redirect logic
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};