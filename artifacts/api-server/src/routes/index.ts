import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import worksRouter from "./works";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(worksRouter);

export default router;
