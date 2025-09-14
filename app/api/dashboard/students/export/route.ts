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

    // Get all students enrolled in instructor's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          createdBy: session.user.id
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true
          }
        }
      },
      orderBy: {
        enrolledAt: "desc"
      }
    });

    // Create CSV content
    const csvHeaders = [
      "Student Name",
      "Student Email", 
      "Course Title",
      "Course Category",
      "Course Level",
      "Enrolled Date",
      "Student Join Date"
    ];

    const csvRows = enrollments.map(enrollment => [
      enrollment.student.name || "N/A",
      enrollment.student.email,
      enrollment.course.title,
      enrollment.course.category || "N/A",
      enrollment.course.level || "N/A",
      enrollment.enrolledAt.toISOString().split('T')[0],
      enrollment.student.createdAt.toISOString().split('T')[0]
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(","))
    ].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="students-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error("Error exporting student data:", error);
    return NextResponse.json(
      { error: "Failed to export student data" },
      { status: 500 }
    );
  }
}
