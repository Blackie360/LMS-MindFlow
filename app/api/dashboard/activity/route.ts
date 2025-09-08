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

    let activities: any[] = [];

    if (userRole === "STUDENT") {
      // Get recent lesson completions and course enrollments
      const [lessonCompletions, courseEnrollments] = await Promise.all([
        prisma.lessonCompletion.findMany({
          where: { studentId: userId },
          take: 10,
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
        }),
        prisma.enrollment.findMany({
          where: { studentId: userId },
          take: 5,
          orderBy: { enrolledAt: "desc" },
          include: {
            course: true
          }
        })
      ]);

      // Format lesson completions as activities
      const lessonActivities = lessonCompletions.map(completion => ({
        id: completion.id,
        type: "lesson_completed",
        title: `Completed "${completion.lesson.title}"`,
        description: `Finished lesson in ${completion.lesson.module.course.title}`,
        timestamp: completion.completedAt,
        courseId: completion.lesson.module.courseId,
        courseTitle: completion.lesson.module.course.title,
        icon: "check-circle",
        color: "success"
      }));

      // Format course enrollments as activities
      const enrollmentActivities = courseEnrollments.map(enrollment => ({
        id: enrollment.id,
        type: "course_enrolled",
        title: `Started "${enrollment.course.title}"`,
        description: `Enrolled in new course`,
        timestamp: enrollment.enrolledAt,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        icon: "book-open",
        color: "brand"
      }));

      activities = [...lessonActivities, ...enrollmentActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

    } else if (userRole === "INSTRUCTOR") {
      // Get recent course activities for instructors
      const [recentEnrollments, recentCompletions] = await Promise.all([
        prisma.enrollment.findMany({
          where: {
            course: { createdBy: userId }
          },
          take: 10,
          orderBy: { enrolledAt: "desc" },
          include: {
            student: { select: { name: true, email: true } },
            course: { select: { title: true } }
          }
        }),
        prisma.lessonCompletion.findMany({
          where: {
            lesson: {
              module: {
                course: { createdBy: userId }
              }
            }
          },
          take: 10,
          orderBy: { completedAt: "desc" },
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: { select: { title: true } }
                  }
                }
              }
            }
          }
        })
      ]);

      const enrollmentActivities = recentEnrollments.map(enrollment => ({
        id: enrollment.id,
        type: "student_enrolled",
        title: `${enrollment.student.name || enrollment.student.email} enrolled`,
        description: `New student in ${enrollment.course.title}`,
        timestamp: enrollment.enrolledAt,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        icon: "user-plus",
        color: "brand"
      }));

      const completionActivities = recentCompletions.map(completion => ({
        id: completion.id,
        type: "student_completed",
        title: `Student completed lesson`,
        description: `Finished "${completion.lesson.title}" in ${completion.lesson.module.course.title}`,
        timestamp: completion.completedAt,
        courseId: completion.lesson.module.courseId,
        courseTitle: completion.lesson.module.course.title,
        icon: "check-circle",
        color: "success"
      }));

      activities = [...enrollmentActivities, ...completionActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    }

    return NextResponse.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
