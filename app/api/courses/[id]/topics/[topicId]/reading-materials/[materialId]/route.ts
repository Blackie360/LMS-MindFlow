import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string; materialId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, materialId } = await params;
    const body = await request.json();
    const { title, description } = body;

    // Check if user has permission to update this reading material
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

    const readingMaterial = await prisma.readingMaterial.update({
      where: { id: materialId },
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
  { params }: { params: Promise<{ id: string; topicId: string; materialId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, materialId } = await params;
    // Check if user has permission to delete this reading material
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

    await prisma.readingMaterial.delete({
      where: { id: materialId },
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
