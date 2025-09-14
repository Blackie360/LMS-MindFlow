import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; topicId: string; materialId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    // Check if user has permission to update this reading material
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

    const readingMaterial = await db.readingMaterial.update({
      where: { id: params.materialId },
      data: {
        title,
        description,
      },
    });

    return NextResponse.json(readingMaterial);
  } catch (error) {
    console.error("Error updating reading material:", error);
    return NextResponse.json(
      { error: "Failed to update reading material" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; topicId: string; materialId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to delete this reading material
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

    await db.readingMaterial.delete({
      where: { id: params.materialId },
    });

    return NextResponse.json({ message: "Reading material deleted successfully" });
  } catch (error) {
    console.error("Error deleting reading material:", error);
    return NextResponse.json(
      { error: "Failed to delete reading material" },
      { status: 500 }
    );
  }
}
