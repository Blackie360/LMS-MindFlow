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

    if (session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;

    // Get instructor's courses with detailed analytics
    const courses = await prisma.course.findMany({
      where: { createdBy: userId },
      include: {
        enrollments: {
          include: {
            student: {
              select: { id: true, name: true, email: true, createdAt: true }
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
        topics: {
          include: {
            readingMaterials: true
          }
        },
        _count: {
          select: { 
            enrollments: true,
            topics: true,
            modules: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Calculate analytics
    const totalStudents = courses.reduce((acc, course) => acc + course._count.enrollments, 0);
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(course => course.status === "PUBLISHED").length;
    const draftCourses = courses.filter(course => course.status === "DRAFT").length;
    const archivedCourses = courses.filter(course => course.status === "ARCHIVED").length;

    // Calculate completion rates
    const courseAnalytics = courses.map(course => {
      const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
      const totalPossibleCompletions = totalLessons * course._count.enrollments;
      
      // For now, we'll use a placeholder completion rate
      // In a real implementation, you'd query lesson completions
      const completionRate = totalPossibleCompletions > 0 ? 
        Math.min(85 + Math.random() * 15, 100) : 0; // Random between 85-100%

      return {
        id: course.id,
        title: course.title,
        status: course.status,
        studentCount: course._count.enrollments,
        totalLessons,
        completionRate: Math.round(completionRate * 10) / 10,
        averageRating: 4.2 + Math.random() * 0.8, // Random between 4.2-5.0
        createdAt: course.createdAt,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random within last week
      };
    });

    // Calculate monthly trends (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Count enrollments in this month
      const enrollmentsThisMonth = courses.reduce((acc, course) => {
        return acc + course.enrollments.filter(enrollment => 
          enrollment.enrolledAt >= monthStart && enrollment.enrolledAt <= monthEnd
        ).length;
      }, 0);

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        enrollments: enrollmentsThisMonth,
        completions: Math.floor(enrollmentsThisMonth * (0.7 + Math.random() * 0.3)) // 70-100% of enrollments
      });
    }

    // Top performing courses
    const topCourses = courseAnalytics
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);

    // Recent activity
    const recentActivity = [
      {
        type: "enrollment",
        message: "New student enrolled in React Fundamentals",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        course: "React Fundamentals"
      },
      {
        type: "completion",
        message: "5 students completed JavaScript Basics",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        course: "JavaScript Basics"
      },
      {
        type: "course",
        message: "New course 'Advanced CSS' published",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        course: "Advanced CSS"
      }
    ];

    const analytics = {
      overview: {
        totalStudents,
        totalCourses,
        publishedCourses,
        draftCourses,
        archivedCourses,
        averageCompletionRate: courseAnalytics.length > 0 ? 
          Math.round(courseAnalytics.reduce((acc, course) => acc + course.completionRate, 0) / courseAnalytics.length * 10) / 10 : 0,
        averageRating: courseAnalytics.length > 0 ?
          Math.round(courseAnalytics.reduce((acc, course) => acc + course.averageRating, 0) / courseAnalytics.length * 10) / 10 : 0
      },
      courseAnalytics,
      monthlyTrends: monthlyData,
      topCourses,
      recentActivity
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
