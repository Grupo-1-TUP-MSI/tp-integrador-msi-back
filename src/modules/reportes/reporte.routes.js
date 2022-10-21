import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getStock
} from "./reporte.controller";
const router = Router();

router.get("/stock", getStock);

export default router;
