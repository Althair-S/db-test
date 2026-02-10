import dbConnect from "./mongodb";
import Program from "@/models/Program";

/**
 * Generate PR number for a program
 * Format: {PROGRAM_CODE}-{YEAR}-{COUNTER}
 * Example: ATLAS-2026-0001
 */
export async function generatePRNumber(programId: string): Promise<string> {
  await dbConnect();

  const currentYear = new Date().getFullYear();

  // Find the program first
  const program = await Program.findOne({
    _id: programId,
    isActive: true,
  });

  if (!program) {
    throw new Error("Program not found or inactive");
  }

  // Determine the next counter value
  let nextCounter: number;
  if (program.prCounterYear !== currentYear) {
    // New year, reset counter
    nextCounter = 1;
  } else {
    // Same year, increment counter
    nextCounter = (program.prCounter || 0) + 1;
  }

  // Update the program with new counter and year
  await Program.findByIdAndUpdate(programId, {
    prCounter: nextCounter,
    prCounterYear: currentYear,
  });

  // Format: PROGRAM-YYYY-NNNN
  const paddedCounter = nextCounter.toString().padStart(4, "0");
  const prNumber = `${program.code}-${currentYear}-${paddedCounter}`;

  return prNumber;
}

/**
 * Get next PR number preview without incrementing counter
 * Used for showing preview in UI
 */
export async function getNextPRNumberPreview(
  programId: string,
): Promise<string> {
  await dbConnect();

  const program = await Program.findById(programId);

  if (!program) {
    throw new Error("Program not found");
  }

  const currentYear = new Date().getFullYear();

  // Determine next counter value
  let nextCounter: number;
  if (program.prCounterYear !== currentYear) {
    nextCounter = 1;
  } else {
    nextCounter = program.prCounter + 1;
  }

  // Format: PROGRAM-YYYY-NNNN
  const paddedCounter = nextCounter.toString().padStart(4, "0");
  const prNumber = `${program.code}-${currentYear}-${paddedCounter}`;

  return prNumber;
}
