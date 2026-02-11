import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import PurchaseRequest from "@/models/PurchaseRequest";

// GET single purchase request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    const pr = await PurchaseRequest.findById(id);

    if (!pr) {
      return NextResponse.json(
        { error: "Purchase request not found" },
        { status: 404 },
      );
    }

    // Users can only view their own PRs
    if (
      session.user.role === "user" &&
      pr.createdBy.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Ensure comments array exists (for old PRs created before comments field)
    if (!pr.comments) {
      pr.comments = [];
    }

    return NextResponse.json(pr);
  } catch (error) {
    console.error("Error fetching purchase request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT update purchase request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await dbConnect();
    const pr = await PurchaseRequest.findById(id);

    if (!pr) {
      return NextResponse.json(
        { error: "Purchase request not found" },
        { status: 404 },
      );
    }

    // Finance can update status
    if (session.user.role === "finance") {
      const { status, rejectionReason } = body;

      if (!status || !["approved", "rejected"].includes(status)) {
        return NextResponse.json(
          { error: "Valid status (approved/rejected) is required" },
          { status: 400 },
        );
      }

      pr.status = status;
      pr.approvedBy = session.user.id as any;
      pr.approvedByName = session.user.name;
      pr.approvedAt = new Date();

      if (status === "rejected" && rejectionReason) {
        pr.rejectionReason = rejectionReason;
      }

      await pr.save();
      return NextResponse.json(pr);
    }

    // Users can edit their own pending PRs
    if (session.user.role === "user") {
      if (pr.createdBy.toString() !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (pr.status !== "pending") {
        return NextResponse.json(
          { error: "Cannot edit approved or rejected purchase requests" },
          { status: 400 },
        );
      }

      const { department, budgeted, costingTo, prNumber, items } = body;

      if (department) pr.department = department;
      if (budgeted !== undefined) pr.budgeted = budgeted;
      if (costingTo) pr.costingTo = costingTo;
      if (prNumber) pr.prNumber = prNumber;
      if (items) pr.items = items;

      await pr.save();
      return NextResponse.json(pr);
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  } catch (error) {
    console.error("Error updating purchase request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE purchase request (user only, pending only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    const pr = await PurchaseRequest.findById(id);

    if (!pr) {
      return NextResponse.json(
        { error: "Purchase request not found" },
        { status: 404 },
      );
    }

    // Users can only delete their own pending PRs
    if (pr.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (pr.status !== "pending") {
      return NextResponse.json(
        { error: "Cannot delete approved or rejected purchase requests" },
        { status: 400 },
      );
    }

    await PurchaseRequest.findByIdAndDelete(id);
    return NextResponse.json({
      message: "Purchase request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting purchase request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
