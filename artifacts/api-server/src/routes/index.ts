import { Router, type IRouter } from "express";
import healthRouter from "./health";
import qrRouter from "./qr";
import trafficRouter from "./traffic";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/qr", qrRouter);
router.use("/traffic", trafficRouter);

export default router;
