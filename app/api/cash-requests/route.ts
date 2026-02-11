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

    let finalVendorName = vendorName;
    let finalBankName = bankName;
    let finalAccountNumber = accountNumber;

    // If vendorId is provided, fetch vendor details
    if (vendorId) {
      const vendor = await Vendor.findById(vendorId);

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
      // Manual input - validate all fields are provided
      if (!vendorName || !bankName || !accountNumber) {
        return NextResponse.json(
          { error: "Vendor details are required" },
          { status: 400 },
        );
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
    let taxAmount = 0;
    if (useTax) {
      taxAmount = calculatedTotal * 0.11; // 11% Tax
    }

    const finalTotalAmount = calculatedTotal + taxAmount;

    // Create cash request
    const cashRequest = await CashRequest.create({
      program: programId,
      programName: program.name,
      programCode: program.code,
      vendor: vendorId || undefined,
      vendorName: finalVendorName,
      bankName: finalBankName,
      accountNumber: finalAccountNumber,
      items: processedItems,
      totalAmount: finalTotalAmount,
      taxAmount: taxAmount,
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
