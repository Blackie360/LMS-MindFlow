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

    let achievements: any[] = [];

    if (userRole === "STUDENT") {
      
      // Calculate student achievements based on their progress
      const [
        totalLessonsCompleted,
        totalCoursesEnrolled,
        coursesCompleted,
        recentCompletions
      ] = await Promise.all([
        prisma.lessonCompletion.count({
          where: { studentId: userId }
        }).catch(err => {
          console.error("Error counting lesson completions:", err);
          return 0;
        }),
        prisma.enrollment.count({
          where: { studentId: userId }
        }).catch(err => {
          console.error("Error counting enrollments:", err);
          return 0;
        }),
        // Count completed courses (all lessons completed)
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
        }).catch(err => {
          console.error("Error fetching course enrollments:", err);
          return [];
        }),
        prisma.lessonCompletion.findMany({
          where: { studentId: userId },
          orderBy: { completedAt: "desc" },
          take: 7
        }).catch(err => {
          console.error("Error fetching recent completions:", err);
          return [];
        })
      ]);

      // Check for completed courses
      let completedCoursesCount = 0;
      for (const enrollment of coursesCompleted) {
        try {
          const totalLessons = enrollment.course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
          const completedLessons = await prisma.lessonCompletion.count({
            where: {
              studentId: userId,
              lesson: {
                module: {
                  courseId: enrollment.course.id
                }
              }
            }
          }).catch(err => {
            console.error("Error counting completed lessons for course:", enrollment.course.id, err);
            return 0;
          });
          
          if (completedLessons === totalLessons && totalLessons > 0) {
            completedCoursesCount++;
          }
        } catch (error) {
          console.error("Error processing course completion:", enrollment.course.id, error);
        }
      }

      // Calculate study streak (consecutive days with lesson completions)
      const streakDays = calculateStudyStreak(recentCompletions);

      // Define achievement criteria
      const achievementDefinitions = [
        {
          id: "first_steps",
          title: "First Steps",
          description: "Complete your first lesson",
          icon: "trophy",
          color: "amber",
          condition: totalLessonsCompleted >= 1,
          progress: Math.min(totalLessonsCompleted, 1),
          maxProgress: 1
        },
        {
          id: "course_master",
          title: "Course Master",
          description: "Complete your first course",
          icon: "medal",
          color: "blue",
          condition: completedCoursesCount >= 1,
          progress: Math.min(completedCoursesCount, 1),
          maxProgress: 1
        },
        {
          id: "streak_master",
          title: "Streak Master",
          description: "Study for 7 consecutive days",
          icon: "badge",
          color: "purple",
          condition: streakDays >= 7,
          progress: Math.min(streakDays, 7),
          maxProgress: 7
        },
        {
          id: "dedicated_learner",
          title: "Dedicated Learner",
          description: "Complete 10 lessons",
          icon: "book-open",
          color: "green",
          condition: totalLessonsCompleted >= 10,
          progress: Math.min(totalLessonsCompleted, 10),
          maxProgress: 10
        },
        {
          id: "knowledge_seeker",
          title: "Knowledge Seeker",
          description: "Enroll in 5 courses",
          icon: "graduation-cap",
          color: "indigo",
          condition: totalCoursesEnrolled >= 5,
          progress: Math.min(totalCoursesEnrolled, 5),
          maxProgress: 5
        },
        {
          id: "completionist",
          title: "Completionist",
          description: "Complete 5 courses",
          icon: "award",
          color: "gold",
          condition: completedCoursesCount >= 5,
          progress: Math.min(completedCoursesCount, 5),
          maxProgress: 5
        }
      ];

      achievements = achievementDefinitions.map(achievement => ({
        ...achievement,
        status: achievement.condition ? "earned" : "in_progress",
        earnedAt: achievement.condition ? new Date().toISOString() : null
      }));

    } else if (userRole === "INSTRUCTOR") {
      // Calculate instructor achievements
      const [
        totalCoursesCreated,
        totalStudents,
        totalLessonsCreated,
        courseRatings
      ] = await Promise.all([
        prisma.course.count({
          where: { createdBy: userId }
        }),
        prisma.enrollment.count({
          where: {
            course: { createdBy: userId }
          }
        }),
        prisma.lesson.count({
          where: {
            module: {
              course: { createdBy: userId }
            }
          }
        }),
        // Placeholder for ratings - would come from a ratings table
        Promise.resolve(4.8)
      ]);

      const achievementDefinitions = [
        {
          id: "first_course",
          title: "First Course",
          description: "Create your first course",
          icon: "book",
          color: "blue",
          condition: totalCoursesCreated >= 1,
          progress: Math.min(totalCoursesCreated, 1),
          maxProgress: 1
        },
        {
          id: "popular_instructor",
          title: "Popular Instructor",
          description: "Have 50 students enrolled",
          icon: "users",
          color: "green",
          condition: totalStudents >= 50,
          progress: Math.min(totalStudents, 50),
          maxProgress: 50
        },
        {
          id: "content_creator",
          title: "Content Creator",
          description: "Create 20 lessons",
          icon: "file-text",
          color: "purple",
          condition: totalLessonsCreated >= 20,
          progress: Math.min(totalLessonsCreated, 20),
          maxProgress: 20
        },
        {
          id: "expert_instructor",
          title: "Expert Instructor",
          description: "Create 5 courses",
          icon: "graduation-cap",
          color: "gold",
          condition: totalCoursesCreated >= 5,
          progress: Math.min(totalCoursesCreated, 5),
          maxProgress: 5
        }
      ];

      achievements = achievementDefinitions.map(achievement => ({
        ...achievement,
        status: achievement.condition ? "earned" : "in_progress",
        earnedAt: achievement.condition ? new Date().toISOString() : null
      }));
    }

    return NextResponse.json({
      success: true,
      data: achievements
    });

  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate study streak
function calculateStudyStreak(completions: any[]): number {
  if (completions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Group completions by date
  const completionsByDate = new Map();
  completions.forEach(completion => {
    const date = new Date(completion.completedAt);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    completionsByDate.set(dateKey, true);
  });

  // Check consecutive days
  while (true) {
    const dateKey = currentDate.toISOString().split('T')[0];
    
    if (completionsByDate.has(dateKey)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
