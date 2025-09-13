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

    // Get user's organization memberships
    const userMemberships = await prisma.member.findMany({
      where: { userId },
      include: { organization: true }
    });

    const organizationIds = userMemberships.map(m => m.organizationId);

    let stats = {};

    if (userRole === "SUPER_ADMIN") {
      // Super Admin - System-wide statistics
      const [
        totalUsers,
        totalOrganizations,
        totalCourses,
        totalEnrollments,
        recentUsers,
        recentOrganizations
      ] = await Promise.all([
        prisma.user.count(),
        prisma.organization.count(),
        prisma.course.count(),
        prisma.enrollment.count(),
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, email: true, createdAt: true }
        }),
        prisma.organization.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, slug: true, createdAt: true }
        })
      ]);

      stats = {
        totalUsers,
        totalOrganizations,
        totalCourses,
        totalEnrollments,
        recentUsers,
        recentOrganizations,
        userRole
      };

    } else if (userRole === "INSTRUCTOR") {
      // Instructor - Course and student statistics
      const [
        myCourses,
        totalStudents,
        totalEnrollments,
        courseCompletions,
        averageRating
      ] = await Promise.all([
        prisma.course.findMany({
          where: { createdBy: userId },
          include: {
            enrollments: {
              include: { student: true }
            },
            _count: {
              select: { enrollments: true }
            }
          }
        }),
        prisma.enrollment.count({
          where: {
            course: { createdBy: userId }
          }
        }),
        prisma.enrollment.count({
          where: {
            course: { createdBy: userId }
          }
        }),
        // Calculate completion rate based on lesson completions
        prisma.lessonCompletion.count({
          where: {
            lesson: {
              module: {
                course: { createdBy: userId }
              }
            }
          }
        }),
        // For now, return a placeholder for average rating
        // In a real app, you'd have a ratings table
        4.8
      ]);

      const totalLessons = await prisma.lesson.count({
        where: {
          module: {
            course: { createdBy: userId }
          }
        }
      });

      const completionRate = totalLessons > 0 ? (courseCompletions / totalLessons) * 100 : 0;

      stats = {
        myCourses,
        totalStudents,
        totalEnrollments,
        completionRate: Math.round(completionRate * 10) / 10,
        averageRating,
        userRole
      };

    } else if (userRole === "STUDENT") {
      // Student - Learning progress statistics
      const [
        enrolledCourses,
        completedLessons,
        totalLessons,
        recentActivity
      ] = await Promise.all([
        prisma.enrollment.findMany({
          where: { studentId: userId },
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true
                  }
                }
              }
            }
          }
        }),
        prisma.lessonCompletion.count({
          where: { studentId: userId }
        }),
        prisma.lesson.count({
          where: {
            module: {
              course: {
                enrollments: {
                  some: { studentId: userId }
                }
              }
            }
          }
        }),
        prisma.lessonCompletion.findMany({
          where: { studentId: userId },
          take: 5,
          orderBy: { completedAt: "desc" },
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: true
                  }
                }
              }
            }
          }
        })
      ]);

      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      stats = {
        enrolledCourses: enrolledCourses.length,
        completedLessons,
        totalLessons,
        progressPercentage: Math.round(progressPercentage * 10) / 10,
        recentActivity,
        userRole
      };
    }

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




