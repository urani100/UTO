import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { db, worksTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { ensureUserRow } from "../lib/users";

const router: IRouter = Router();

const uuidParam = z.object({ id: z.string().uuid() });

const writeBody = z.object({
  name: z.string().min(1).max(120),
  shape: z.string().min(1).max(40),
  state: z.record(z.string(), z.unknown()),
});

// Wraps async route handlers so any thrown error is forwarded to the global
// error handler instead of crashing the process or hanging the request.
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);
}

router.use("/works", requireAuth);

router.get("/works", asyncHandler(async (req, res) => {
  const userId = req.userId!;
  await ensureUserRow(userId);
  const rows = await db
    .select({
      id: worksTable.id,
      name: worksTable.name,
      shape: worksTable.shape,
      createdAt: worksTable.createdAt,
      updatedAt: worksTable.updatedAt,
    })
    .from(worksTable)
    .where(eq(worksTable.userId, userId))
    .orderBy(desc(worksTable.updatedAt));
  res.json(rows);
}));

router.post("/works", asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const parsed = writeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  await ensureUserRow(userId);
  const inserted = await db
    .insert(worksTable)
    .values({
      userId,
      name: parsed.data.name,
      shape: parsed.data.shape,
      state: parsed.data.state,
    })
    .returning();
  res.json(toWork(inserted[0]!));
}));

router.get("/works/:id", asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const params = uuidParam.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const rows = await db
    .select()
    .from(worksTable)
    .where(and(eq(worksTable.id, params.data.id), eq(worksTable.userId, userId)))
    .limit(1);
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toWork(rows[0]));
}));

router.put("/works/:id", asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const params = uuidParam.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const parsed = writeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const updated = await db
    .update(worksTable)
    .set({
      name: parsed.data.name,
      shape: parsed.data.shape,
      state: parsed.data.state,
      updatedAt: new Date(),
    })
    .where(and(eq(worksTable.id, params.data.id), eq(worksTable.userId, userId)))
    .returning();
  if (!updated[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toWork(updated[0]));
}));

router.delete("/works/:id", asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const params = uuidParam.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const deleted = await db
    .delete(worksTable)
    .where(and(eq(worksTable.id, params.data.id), eq(worksTable.userId, userId)))
    .returning({ id: worksTable.id });
  if (!deleted[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ok: true });
}));

function toWork(row: typeof worksTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    shape: row.shape,
    state: row.state,
    schemaVer: row.schemaVer,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export default router;
