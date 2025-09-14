import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const isTemplate = searchParams.get("isTemplate") === "true";

    const courses = await prisma.course.findMany({
      where: {
        ...(organizationId && { organizationId }),
        ...(isTemplate !== null && { isTemplate }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        topics: {
          orderBy: { order: "asc" },
          include: {
            readingMaterials: true,
          },
        },
        modules: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
            topics: true,
            modules: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      thumbnail,
      category,
      level,
      estimatedHours,
      prerequisites,
      learningObjectives,
      isTemplate,
      templateName,
      organizationId,
      topics,
    } = body;

    // Create the course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        category,
        level,
        estimatedHours,
        prerequisites,
        learningObjectives,
        isTemplate: isTemplate || false,
        templateName,
        createdBy: session.user.id,
        organizationId,
        topics: {
          create: topics?.map((topic: any, index: number) => ({
            title: topic.title,
            description: topic.description,
            order: index + 1,
          })) || [],
        },
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        topics: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
