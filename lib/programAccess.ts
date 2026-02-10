import dbConnect from "./mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

/**
 * Validate if a user has access to a specific program
 * @param userId - User ID
 * @param programId - Program ID to check access for
 * @param role - User role
 * @returns true if user has access, false otherwise
 */
export async function validateProgramAccess(
  userId: string,
  programId: string,
  role: string,
): Promise<boolean> {
  // Admin has access to all programs
  if (role === "admin") {
    return true;
  }

  await dbConnect();

  // Check if user has this program in their programAccess array
  const user = await User.findById(userId);

  if (!user) {
    return false;
  }

  // Convert programId to ObjectId for comparison
  const programObjectId = new mongoose.Types.ObjectId(programId);

  // Check if programId exists in user's programAccess array
  const hasAccess = user.programAccess.some((accessId) =>
    accessId.equals(programObjectId),
  );

  return hasAccess;
}

/**
 * Get all program IDs that a user has access to
 * @param userId - User ID
 * @param role - User role
 * @returns Array of program IDs
 */
export async function getUserProgramAccess(
  userId: string,
  role: string,
): Promise<mongoose.Types.ObjectId[]> {
  // Admin has access to all programs (return empty array to indicate "all")
  if (role === "admin") {
    return [];
  }

  await dbConnect();

  const user = await User.findById(userId);

  if (!user) {
    return [];
  }

  return user.programAccess;
}

/**
 * Check if user has access to any programs
 * @param userId - User ID
 * @param role - User role
 * @returns true if user has at least one program access
 */
export async function hasAnyProgramAccess(
  userId: string,
  role: string,
): Promise<boolean> {
  // Admin always has access
  if (role === "admin") {
    return true;
  }

  await dbConnect();

  const user = await User.findById(userId);

  if (!user) {
    return false;
  }

  return user.programAccess.length > 0;
}
