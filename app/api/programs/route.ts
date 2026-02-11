import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connect from "@/lib/db";
import { getUserProgramAccess } from "@/lib/programAccess";
import Program from "@/models/Program";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    // Get programs based on user access
    const programIds = await getUserProgramAccess(
      session.user.id!,
      session.user.role,
    );

    let programs;
    if (session.user.role === "admin") {
      // Admin sees all active programs
      programs = await Program.find({ isActive: true }).sort({ name: 1 });
    } else {
      // Others see only assigned programs that are active
      programs = await Program.find({
        _id: { $in: programIds.map((id) => id.toString()) },
        isActive: true,
      }).sort({ name: 1 });
    }

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, code, description, isActive } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and Code are required" },
        { status: 400 },
      );
    }

    await connect();

    // Check for existing code or name
    const existingProgram = await Program.findOne({
      $or: [{ code: code.toUpperCase() }, { name }],
    });

    if (existingProgram) {
      return NextResponse.json(
        { error: "Program with this code or name already exists" },
        { status: 409 },
      );
    }

    const newProgram = await Program.create({
      name,
      code: code.toUpperCase(),
      description,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: session.user.id,
      createdByName: (session.user.name as string) || "Unknown",
    });

    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    const err = error as Error & { code?: number };
    console.error("Error creating program:", err);
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Program code or name must be unique" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
