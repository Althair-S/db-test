import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connect from "@/lib/db";
import Vendor from "@/models/Vendor";

// GET all vendors (admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow all authenticated users to view vendors for autocomplete
    // if (session.user.role !== "admin") { ... }

    await connect();

    const vendors = await Vendor.find({}).sort({ name: 1 });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create new vendor (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can create vendors
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, bankName, accountNumber } = body;

    // Validation
    if (!name || !bankName || !accountNumber) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    await connect();

    // Create vendor
    const vendor = await Vendor.create({
      name,
      bankName,
      accountNumber,
      createdBy: session.user.id,
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
