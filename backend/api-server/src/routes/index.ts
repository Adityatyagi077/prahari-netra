import { Router, type IRouter } from "express";
import healthRouter from "./health";
import phoneRouter from "./phone";
import presenceRouter from "./presence";

const router: IRouter = Router();

router.use(healthRouter);
router.use(phoneRouter);
router.use(presenceRouter);

export default router;
