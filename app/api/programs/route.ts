import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import { getUserProgramAccess } from "@/lib/programAccess";
import Program from "@/models/Program";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get programs based on user access
    const programIds = await getUserProgramAccess(
      session.user.id,
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
