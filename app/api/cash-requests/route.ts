import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connect from "@/lib/db";
import CashRequest from "@/models/CashRequest";
import Vendor from "@/models/Vendor";
import Program from "@/models/Program";
import {
  validateProgramAccess,
  getUserProgramAccess,
} from "@/lib/programAccess";

// GET all cash requests (filtered by role and program access)
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    let cashRequests;

    if (session.user.role === "admin") {
      // Admin and Finance can see all CRs
      cashRequests = await CashRequest.find({}).sort({ createdAt: -1 });
    } else if (session.user.role === "finance") {
      // Finance can see CRs from programs they have access to
      const programIds = await getUserProgramAccess(
        session.user.id,
        session.user.role,
      );

      if (programIds.length === 0) {
        return NextResponse.json([]);
      }

      cashRequests = await CashRequest.find({
        program: { $in: programIds },
      }).sort({ createdAt: -1 });
    } else {
      // Users can only see their own CRs
      cashRequests = await CashRequest.find({
        createdBy: session.user.id,
      }).sort({ createdAt: -1 });
    }

    return NextResponse.json(cashRequests);
  } catch (error) {
    console.error("Error fetching cash requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create new cash request (user and finance)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Users and Finance can create CRs, but not admin
    if (session.user.role === "admin") {
      return NextResponse.json(
        { error: "Admins cannot create cash requests" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      programId,
      activityName, // New field
      vendorId,
      vendorName,
      bankName,
      accountNumber,
      items, // Expecting array of { description, quantity, price }
      useTax,
    } = body;

    // Validation
    if (!programId) {
      return NextResponse.json(
        { error: "Program is required" },
        { status: 400 },
      );
    }

    if (!activityName) {
      return NextResponse.json(
        { error: "Activity name is required" },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
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

    let finalVendorId = vendorId;
    let finalVendorName = vendorName;
    let finalBankName = bankName;
    let finalAccountNumber = accountNumber;

    // If vendorId is provided, fetch vendor details
    if (finalVendorId) {
      const vendor = await Vendor.findById(finalVendorId);

      if (!vendor) {
        return NextResponse.json(
          { error: "Vendor not found" },
          { status: 404 },
        );
      }

      finalVendorName = vendor.name;
      finalBankName = vendor.bankName;
      finalAccountNumber = vendor.accountNumber;
    } else {
      // Manual input provided - Check if we should auto-create or link to existing vendor
      if (!vendorName || !bankName || !accountNumber) {
        return NextResponse.json(
          { error: "Vendor details are required" },
          { status: 400 },
        );
      }

      // Check if vendor with this name already exists (case insensitive)
      const existingVendor = await Vendor.findOne({
        name: { $regex: new RegExp(`^${vendorName}$`, "i") },
      });

      if (existingVendor) {
        // Use existing vendor
        finalVendorId = existingVendor._id;
        // Optionally update details? For now, we'll keep existing vendor details to be safe,
        // or we could overwrite. Let's stick to using the existing vendor's *official* details
        // to ensure consistency, but if they differ significantly it might be confusing.
        // User requirement: "if vendor name sdh ada... helps filling...".
        // Implies we probably already selected it in UI, but if we typed it manually and it matched, use it.
        finalVendorName = existingVendor.name;
        finalBankName = existingVendor.bankName;
        finalAccountNumber = existingVendor.accountNumber;
      } else {
        // Create new vendor
        try {
          const newVendor = await Vendor.create({
            name: vendorName,
            bankName: bankName,
            accountNumber: accountNumber,
            createdBy: session.user.id,
          });
          finalVendorId = newVendor._id;
          finalVendorName = newVendor.name;
          finalBankName = newVendor.bankName;
          finalAccountNumber = newVendor.accountNumber;
        } catch (error) {
          console.error("Error auto-creating vendor:", error);
          // Fallback to manual (no ID) if creation fails for some reason,
          // though validation should catch most issues.
        }
      }
    }

    // Calculate totals server-side
    let calculatedTotal = 0;
    const processedItems = items.map(
      (item: {
        description: string;
        quantity: number | string;
        price: number | string;
      }) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const total = quantity * price;
        calculatedTotal += total;

        return {
          description: item.description,
          quantity,
          price,
          total,
        };
      },
    );

    // Calculate Tax
    // User Requirement: "Grand total = Sum Item - tax"
    // Tax is calculated as a percentage of the subtotal (PPh deduction)
    let taxAmount = 0;
    let taxPercent = 0;

    if (useTax) {
      // Extract tax percentage from request body or default to 0
      taxPercent = Number(body.taxPercentage) || 0;
      taxAmount = calculatedTotal * (taxPercent / 100);
    }

    // Deduction logic: Total = Subtotal - Tax
    const finalTotalAmount = calculatedTotal - taxAmount;

    // Create cash request
    const cashRequest = await CashRequest.create({
      program: programId,
      programName: program.name,
      programCode: program.code,
      activityName: activityName,
      vendor: finalVendorId || undefined,
      vendorName: finalVendorName,
      bankName: finalBankName,
      accountNumber: finalAccountNumber,
      items: processedItems,
      totalAmount: finalTotalAmount,
      taxAmount: taxAmount,
      taxPercentage: taxPercent, // Save the percentage
      useTax: Boolean(useTax),
      status: "pending",
      createdBy: session.user.id,
      createdByName: session.user.name,
    });

    return NextResponse.json(cashRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating cash request:", error);
    const errorMessage = (error as Error).message || "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 },
    );
  }
}
