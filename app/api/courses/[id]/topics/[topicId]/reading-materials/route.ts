import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; topicId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const readingMaterials = await db.readingMaterial.findMany({
      where: { topicId: params.topicId },
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
  { params }: { params: { id: string; topicId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, fileName, fileUrl, fileSize, fileType } = body;

    // Check if user has permission to add reading materials to this topic
    const course = await db.course.findUnique({
      where: { id: params.id },
      select: { createdBy: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the topic belongs to this course
    const topic = await db.topic.findUnique({
      where: { id: params.topicId },
      select: { courseId: true },
    });

    if (!topic || topic.courseId !== params.id) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const readingMaterial = await db.readingMaterial.create({
      data: {
        topicId: params.topicId,
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
