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

    let tasks: any[] = [];

    if (userRole === "STUDENT") {
      // Get upcoming tasks for students
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: userId },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: {
                    orderBy: { order: "asc" }
                  }
                },
                orderBy: { order: "asc" }
              }
            }
          }
        }
      });

      // Generate tasks based on course progress
      for (const enrollment of enrollments) {
        const course = enrollment.course;
        const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
        
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

        // Find next lesson to complete
        for (const module of course.modules) {
          for (const lesson of module.lessons) {
            const isCompleted = await prisma.lessonCompletion.findUnique({
              where: {
                lessonId_studentId: {
                  lessonId: lesson.id,
                  studentId: userId
                }
              }
            });

            if (!isCompleted) {
              // This is the next lesson to complete
              const dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + 3); // Due in 3 days

              tasks.push({
                id: `lesson-${lesson.id}`,
                type: "lesson",
                title: `Complete "${lesson.title}"`,
                description: `Next lesson in ${course.title}`,
                dueDate: dueDate,
                priority: "medium",
                courseId: course.id,
                courseTitle: course.title,
                lessonId: lesson.id,
                icon: "book-open",
                color: "brand"
              });
              break;
            }
          }
          if (tasks.length > 0) break; // Only add one task per course
        }

        // Add course completion task if almost done
        if (completedLessons > 0 && completedLessons < totalLessons) {
          const progressPercentage = (completedLessons / totalLessons) * 100;
          if (progressPercentage > 80) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7); // Due in 1 week

            tasks.push({
              id: `course-${course.id}`,
              type: "course_completion",
              title: `Complete "${course.title}"`,
              description: `Finish remaining lessons (${totalLessons - completedLessons} left)`,
              dueDate: dueDate,
              priority: "high",
              courseId: course.id,
              courseTitle: course.title,
              icon: "trophy",
              color: "success"
            });
          }
        }
      }

      // Sort tasks by due date
      tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    } else if (userRole === "INSTRUCTOR") {
      // Get upcoming tasks for instructors
      const courses = await prisma.course.findMany({
        where: { createdBy: userId },
        include: {
          modules: {
            include: {
              lessons: true
            }
          },
          _count: {
            select: { enrollments: true }
          }
        }
      });

      for (const course of courses) {
        // Add course creation tasks if course is draft
        if (course.status === "DRAFT") {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 5); // Due in 5 days

          tasks.push({
            id: `publish-${course.id}`,
            type: "course_publish",
            title: `Publish "${course.title}"`,
            description: "Complete course setup and publish",
            dueDate: dueDate,
            priority: "high",
            courseId: course.id,
            courseTitle: course.title,
            icon: "upload",
            color: "warning"
          });
        }

        // Add content creation tasks for courses with few lessons
        const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
        if (totalLessons < 5) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 10); // Due in 10 days

          tasks.push({
            id: `content-${course.id}`,
            type: "content_creation",
            title: `Add more content to "${course.title}"`,
            description: `Course has only ${totalLessons} lessons`,
            dueDate: dueDate,
            priority: "medium",
            courseId: course.id,
            courseTitle: course.title,
            icon: "plus-circle",
            color: "brand"
          });
        }
      }

      // Sort tasks by due date
      tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    return NextResponse.json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error("Error fetching upcoming tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
