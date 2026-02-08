import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import PurchaseRequest from "@/models/PurchaseRequest";

// GET all purchase requests (filtered by role)
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let purchaseRequests;

    // Admin and Finance can see all PRs
    if (session.user.role === "admin" || session.user.role === "finance") {
      purchaseRequests = await PurchaseRequest.find({}).sort({ createdAt: -1 });
    } else {
      // Users can only see their own PRs
      purchaseRequests = await PurchaseRequest.find({
        createdBy: session.user.id,
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
    const { department, budgeted, costingTo, prNumber, items } = body;

    // Validation
    if (
      !department ||
      budgeted === undefined ||
      !costingTo ||
      !prNumber ||
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

    await dbConnect();

    // Check if PR number already exists
    const existingPR = await PurchaseRequest.findOne({ prNumber });
    if (existingPR) {
      return NextResponse.json(
        { error: "PR Number already exists" },
        { status: 400 },
      );
    }

    // Create purchase request
    const purchaseRequest = await PurchaseRequest.create({
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
