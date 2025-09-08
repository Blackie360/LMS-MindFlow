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

    let courses: any[] = [];

    if (userRole === "INSTRUCTOR") {
      // Get instructor's courses with detailed statistics
      courses = await prisma.course.findMany({
        where: { createdBy: userId },
        include: {
          enrollments: {
            include: {
              student: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          modules: {
            include: {
              lessons: true,
              _count: {
                select: { lessons: true }
              }
            }
          },
          _count: {
            select: { enrollments: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      // Add calculated fields for each course
      courses = courses.map(course => {
        const totalLessons = course.modules.reduce((acc: number, module: any) => acc + module.lessons.length, 0);
        const completedLessons = course.enrollments.reduce((acc: number, enrollment: any) => {
          // This would need to be calculated based on lesson completions
          // For now, return a placeholder
          return acc + Math.floor(totalLessons * 0.8); // 80% completion placeholder
        }, 0);
        
        const completionRate = totalLessons > 0 ? (completedLessons / (totalLessons * course.enrollments.length)) * 100 : 0;
        
        return {
          ...course,
          totalLessons,
          completedLessons,
          completionRate: Math.round(completionRate * 10) / 10,
          averageRating: 4.8, // Placeholder - would come from ratings table
          studentCount: course._count.enrollments
        };
      });

    } else if (userRole === "STUDENT") {
      // Get student's enrolled courses with progress
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: userId },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: true
                }
              },
              instructor: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        },
        orderBy: { enrolledAt: "desc" }
      });

      // Calculate progress for each course
      courses = await Promise.all(enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        const totalLessons = course.modules.reduce((acc: number, module: any) => acc + module.lessons.length, 0);
        
        const completedLessons = await prisma.lessonCompletion.count({
          where: {
            studentId: userId,
            lesson: {
              module: {
                courseId: course.id
              }
            }
          }
        });

        const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
          ...course,
          enrollmentId: enrollment.id,
          enrolledAt: enrollment.enrolledAt,
          totalLessons,
          completedLessons,
          progressPercentage: Math.round(progressPercentage * 10) / 10,
          instructor: course.instructor
        };
      }));

    } else if (userRole === "SUPER_ADMIN") {
      // Get all courses for super admin
      courses = await prisma.course.findMany({
        include: {
          instructor: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: { enrollments: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      courses = courses.map(course => ({
        ...course,
        studentCount: course._count.enrollments,
        averageRating: 4.8 // Placeholder
      }));
    }

    return NextResponse.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
