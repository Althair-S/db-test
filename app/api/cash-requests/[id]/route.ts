import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import CashRequest from "@/models/CashRequest";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET single cash request by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const cashRequest = await CashRequest.findById(id);

    if (!cashRequest) {
      return NextResponse.json(
        { error: "Cash request not found" },
        { status: 404 },
      );
    }

    // Check access: admin and finance can see all, users can only see their own
    if (
      session.user.role !== "admin" &&
      session.user.role !== "finance" &&
      cashRequest.createdBy.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(cashRequest);
  } catch (error) {
    console.error("Error fetching cash request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH update cash request (for approval/rejection by finance, or editing by owner)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason, amount, description } = body;

    await dbConnect();

    const cashRequest = await CashRequest.findById(id);

    if (!cashRequest) {
      return NextResponse.json(
        { error: "Cash request not found" },
        { status: 404 },
      );
    }

    // Finance can approve/reject
    if (session.user.role === "finance") {
      if (status === "approved") {
        cashRequest.status = "approved";
        cashRequest.approvedBy = new mongoose.Types.ObjectId(session.user.id);
        cashRequest.approvedByName = session.user.name;
        cashRequest.approvedAt = new Date();
      } else if (status === "rejected") {
        cashRequest.status = "rejected";
        cashRequest.rejectionReason = rejectionReason || "No reason provided";
      }
    }
    // Users can edit their own pending CRs
    else if (session.user.role === "user") {
      if (cashRequest.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "You can only edit your own cash requests" },
          { status: 403 },
        );
      }

      if (cashRequest.status !== "pending") {
        return NextResponse.json(
          { error: "You can only edit pending cash requests" },
          { status: 400 },
        );
      }

      // Update editable fields
      if (amount !== undefined) cashRequest.amount = amount;
      if (description !== undefined) cashRequest.description = description;
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await cashRequest.save();

    return NextResponse.json(cashRequest);
  } catch (error) {
    console.error("Error updating cash request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE cash request (users can delete their own pending CRs)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const cashRequest = await CashRequest.findById(id);

    if (!cashRequest) {
      return NextResponse.json(
        { error: "Cash request not found" },
        { status: 404 },
      );
    }

    // Only the creator can delete, and only if pending
    if (cashRequest.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own cash requests" },
        { status: 403 },
      );
    }

    if (cashRequest.status !== "pending") {
      return NextResponse.json(
        { error: "You can only delete pending cash requests" },
        { status: 400 },
      );
    }

    await CashRequest.findByIdAndDelete(id);

    return NextResponse.json({ message: "Cash request deleted successfully" });
  } catch (error) {
    console.error("Error deleting cash request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
