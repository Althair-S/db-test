import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Program from "@/models/Program";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET single program
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can access this endpoint
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can manage programs" },
        { status: 403 },
      );
    }

    const { id } = await params;

    await dbConnect();

    const program = await Program.findById(id);

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH update program
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can update programs
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update programs" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, isActive } = body;

    await dbConnect();

    const program = await Program.findById(id);

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Update allowed fields (code cannot be changed)
    if (name !== undefined) {
      // Check if new name already exists (excluding current program)
      const existingName = await Program.findOne({
        name,
        _id: { $ne: id },
      });
      if (existingName) {
        return NextResponse.json(
          { error: "Program name already exists" },
          { status: 400 },
        );
      }
      program.name = name;
    }

    if (description !== undefined) {
      program.description = description;
    }

    if (isActive !== undefined) {
      program.isActive = isActive;
    }

    await program.save();

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE deactivate program (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can delete programs
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete programs" },
        { status: 403 },
      );
    }

    const { id } = await params;

    await dbConnect();

    const program = await Program.findById(id);

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Soft delete - set isActive to false
    program.isActive = false;
    await program.save();

    return NextResponse.json({
      message: "Program deactivated successfully",
      program,
    });
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
