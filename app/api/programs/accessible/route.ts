import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Program from "@/models/Program";
import { getUserProgramAccess } from "@/lib/programAccess";

// GET programs accessible by current user
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let programs;

    if (session.user.role === "admin") {
      // Admin can access all active programs
      programs = await Program.find({ isActive: true })
        .select("_id name code description")
        .sort({ name: 1 });
    } else {
      // User/Finance can only access programs in their programAccess array
      const programIds = await getUserProgramAccess(
        session.user.id,
        session.user.role,
      );

      if (programIds.length === 0) {
        return NextResponse.json([]);
      }

      // Convert ObjectIds to strings for query
      const programIdStrings = programIds.map((id) => id.toString());

      programs = await Program.find({
        _id: { $in: programIdStrings },
        isActive: true,
      })
        .select("_id name code description")
        .sort({ name: 1 });
    }

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching accessible programs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
