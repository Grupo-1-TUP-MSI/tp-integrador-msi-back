import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getStock,
  getPendienteEntrega
} from "./reporte.controller";
const router = Router();

router.get("/stock", getStock);
router.get("/np/pde", getPendienteEntrega);

export default router;
