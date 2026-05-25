import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { ensureUserRow } from "../lib/users";

const router: IRouter = Router();

router.get("/me", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.json({ user: null });
  }
  try {
    const user = await ensureUserRow(userId);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load user");
    return res.status(500).json({ error: "Failed to load user" });
  }
});

export default router;
