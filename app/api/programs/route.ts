import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Program from "@/models/Program";

// GET all programs (with optional filter)
export async function GET(request: NextRequest) {
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

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    let query = {};
    if (activeOnly) {
      query = { isActive: true };
    }

    const programs = await Program.find(query).sort({ createdAt: -1 });

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create new program (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can create programs
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create programs" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, code, description } = body;

    // Validation
    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 },
      );
    }

    // Validate code format
    const codeRegex = /^[A-Z0-9]+$/;
    const upperCode = code.toUpperCase();
    if (
      !codeRegex.test(upperCode) ||
      upperCode.length < 3 ||
      upperCode.length > 10
    ) {
      return NextResponse.json(
        {
          error:
            "Code must be 3-10 alphanumeric characters (letters and numbers only)",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    // Check if code already exists
    const existingProgram = await Program.findOne({ code: upperCode });
    if (existingProgram) {
      return NextResponse.json(
        { error: "Program code already exists" },
        { status: 400 },
      );
    }

    // Check if name already exists
    const existingName = await Program.findOne({ name });
    if (existingName) {
      return NextResponse.json(
        { error: "Program name already exists" },
        { status: 400 },
      );
    }

    // Create program
    const program = await Program.create({
      name,
      code: upperCode,
      description: description || "",
      isActive: true,
      prCounter: 0,
      prCounterYear: new Date().getFullYear(),
      createdBy: session.user.id,
      createdByName: session.user.name,
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
