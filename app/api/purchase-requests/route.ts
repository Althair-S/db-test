import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connect from "@/lib/db";
import PurchaseRequest from "@/models/PurchaseRequest";
import Program from "@/models/Program";
import { generatePRNumber } from "@/lib/prNumberGenerator";
import {
  validateProgramAccess,
  getUserProgramAccess,
} from "@/lib/programAccess";

// GET all purchase requests (filtered by role and program access)
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    let purchaseRequests;

    if (session.user.role === "admin") {
      // Admin can see all PRs
      purchaseRequests = await PurchaseRequest.find({}).sort({ createdAt: -1 });
    } else if (session.user.role === "finance") {
      // Finance can see PRs from programs they have access to
      const programIds = await getUserProgramAccess(
        session.user.id,
        session.user.role,
      );

      if (programIds.length === 0) {
        return NextResponse.json([]);
      }

      purchaseRequests = await PurchaseRequest.find({
        program: { $in: programIds },
      }).sort({ createdAt: -1 });
    } else {
      // Users can only see their own PRs from programs they have access to
      const programIds = await getUserProgramAccess(
        session.user.id,
        session.user.role,
      );

      if (programIds.length === 0) {
        return NextResponse.json([]);
      }

      purchaseRequests = await PurchaseRequest.find({
        createdBy: session.user.id,
        program: { $in: programIds },
      }).sort({ createdAt: -1 });
    }

    return NextResponse.json(purchaseRequests);
  } catch (error) {
    console.error("Error fetching purchase requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create new purchase request (user role)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only users can create PRs (not admin or finance)
    if (session.user.role !== "user") {
      return NextResponse.json(
        { error: "Only users can create purchase requests" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { department, budgeted, costingTo, programId, activityName, items } =
      body;

    // Validation
    if (
      !department ||
      budgeted === undefined ||
      !costingTo ||
      !programId ||
      !activityName ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "All fields are required and at least one item must be provided",
        },
        { status: 400 },
      );
    }

    await connect();

    // Validate user has access to this program
    const hasAccess = await validateProgramAccess(
      session.user.id,
      programId,
      session.user.role,
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have access to this program" },
        { status: 403 },
      );
    }

    // Get program details
    const program = await Program.findById(programId);

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (!program.isActive) {
      return NextResponse.json(
        { error: "Program is not active" },
        { status: 400 },
      );
    }

    // Generate PR number automatically
    const prNumber = await generatePRNumber(programId);

    // Create purchase request
    const purchaseRequest = await PurchaseRequest.create({
      program: programId,
      programName: program.name,
      programCode: program.code,
      activityName,
      department,
      budgeted,
      costingTo,
      prNumber,
      items,
      status: "pending",
      createdBy: session.user.id,
      createdByName: session.user.name,
    });

    return NextResponse.json(purchaseRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
