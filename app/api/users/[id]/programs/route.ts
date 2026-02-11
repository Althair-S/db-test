import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET user's program access
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can manage user program access
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can manage user program access" },
        { status: 403 },
      );
    }

    const { id } = await params;

    await dbConnect();

    const user = await User.findById(id).populate("programAccess", "name code");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      programAccess: user.programAccess,
    });
  } catch (error) {
    console.error("Error fetching user program access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT update user's program access
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can manage user program access
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can manage user program access" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { programIds } = body;

    // Validation
    if (!Array.isArray(programIds)) {
      return NextResponse.json(
        { error: "programIds must be an array" },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert string IDs to ObjectIds
    const objectIds = programIds.map(
      (id) => new mongoose.Types.ObjectId(id as string),
    );

    // Update user's program access
    user.programAccess = objectIds;
    await user.save();

    // Populate program details for response
    await user.populate("programAccess", "name code");

    return NextResponse.json({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      programAccess: user.programAccess,
    });
  } catch (error) {
    console.error("Error updating user program access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
