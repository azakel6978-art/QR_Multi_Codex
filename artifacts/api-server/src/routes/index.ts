import { Router, type IRouter } from "express";
import healthRouter from "./health";
import qrRouter from "./qr";
import trafficRouter from "./traffic";
import searchRouter from "./search";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/qr", qrRouter);
router.use("/traffic", trafficRouter);
router.use("/search", searchRouter);

export default router;
