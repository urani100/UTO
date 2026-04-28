import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { clerkClient } from "@clerk/express";

/**
 * Ensure a row exists in our local users table for the given Clerk user id.
 * Pulls email + display name from Clerk and upserts.
 *
 * Returns the local row.
 */
export async function ensureUserRow(userId: string) {
  // Fast path: already present.
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (existing[0]) return existing[0];

  let email: string | null = null;
  let displayName: string | null = null;
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    email =
      clerkUser.emailAddresses?.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress ??
      null;
    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      null;
    displayName = fullName;
  } catch {
    // If Clerk lookup fails we still create the local stub row.
  }

  const inserted = await db
    .insert(usersTable)
    .values({ id: userId, email, displayName })
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        email: sql`excluded.email`,
        displayName: sql`excluded.display_name`,
        updatedAt: sql`now()`,
      },
    })
    .returning();
  return inserted[0]!;
}
