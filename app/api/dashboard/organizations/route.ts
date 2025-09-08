import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    let organizations = [];

    if (userRole === "SUPER_ADMIN") {
      // Super Admin - Get all organizations with statistics
      organizations = await prisma.organization.findMany({
        include: {
          _count: {
            select: {
              members: true,
              teams: true
            }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      // Add calculated statistics
      organizations = await Promise.all(organizations.map(async (org) => {
        const courseCount = await prisma.course.count({
          where: { organizationId: org.id }
        });

        const enrollmentCount = await prisma.enrollment.count({
          where: {
            course: { organizationId: org.id }
          }
        });

        return {
          ...org,
          courseCount,
          enrollmentCount,
          memberCount: org._count.members,
          teamCount: org._count.teams
        };
      }));

    } else {
      // Regular users - Get their organization memberships
      const memberships = await prisma.member.findMany({
        where: { userId },
        include: {
          organization: {
            include: {
              _count: {
                select: {
                  members: true,
                  teams: true
                }
              }
            }
          }
        }
      });

      organizations = await Promise.all(memberships.map(async (membership) => {
        const org = membership.organization;
        
        const courseCount = await prisma.course.count({
          where: { organizationId: org.id }
        });

        const enrollmentCount = await prisma.enrollment.count({
          where: {
            course: { organizationId: org.id }
          }
        });

        return {
          ...org,
          membershipRole: membership.role,
          membershipStatus: membership.status,
          courseCount,
          enrollmentCount,
          memberCount: org._count.members,
          teamCount: org._count.teams
        };
      }));
    }

    return NextResponse.json({
      success: true,
      data: organizations
    });

  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
