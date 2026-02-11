import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import PurchaseRequest from "@/models/PurchaseRequest";

// POST - Add comment to PR (finance only)
export async function POST(
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
    const { comment } = body;

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const pr = await PurchaseRequest.findById(id);

    if (!pr) {
      return NextResponse.json(
        { error: "Purchase request not found" },
        { status: 404 },
      );
    }

    // Users can only comment on their own PRs
    if (
      session.user.role === "user" &&
      pr.createdBy.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: "You can only comment on your own purchase requests" },
        { status: 403 },
      );
    }

    // Add comment
    // Initialize comments array if it doesn't exist
    if (!pr.comments) {
      pr.comments = [];
    }

    // Set default activityName for old PRs (created before this field existed)
    if (!pr.activityName) {
      pr.activityName = "N/A";
    }

    pr.comments.push({
      commentedBy: session.user.id as any,
      commentedByName: session.user.name,
      commentedByRole: session.user.role,
      comment: comment.trim(),
      createdAt: new Date(),
    });

    // Mark as revision requested
    pr.revisionRequested = true;

    // Save without running validators (to avoid issues with old PRs)
    await pr.save({ validateBeforeSave: false });

    return NextResponse.json({ success: true, pr });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
