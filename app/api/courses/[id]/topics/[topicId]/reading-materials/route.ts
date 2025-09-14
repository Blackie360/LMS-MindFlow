import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topicId } = await params;
    const readingMaterials = await prisma.readingMaterial.findMany({
      where: { topicId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(readingMaterials);
  } catch (error) {
    console.error("Error fetching reading materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch reading materials" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, topicId } = await params;
    const body = await request.json();
    const { title, description, fileName, fileUrl, fileSize, fileType } = body;

    // Check if user has permission to add reading materials to this topic
    const course = await prisma.course.findUnique({
      where: { id },
      select: { createdBy: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the topic belongs to this course
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { courseId: true },
    });

    if (!topic || topic.courseId !== id) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const readingMaterial = await prisma.readingMaterial.create({
      data: {
        topicId,
        title,
        description,
        fileName,
        fileUrl,
        fileSize,
        fileType,
      },
    });

    return NextResponse.json(readingMaterial, { status: 201 });
  } catch (error) {
    console.error("Error creating reading material:", error);
    return NextResponse.json(
      { error: "Failed to create reading material" },
      { status: 500 }
    );
  }
}
