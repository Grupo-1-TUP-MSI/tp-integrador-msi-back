import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getStock,
  getPendienteEntrega,
  getCompraVentaMensual
} from "./reporte.controller";
const router = Router();

router.get("/stock", getStock);
router.get("/np/pde", getPendienteEntrega);
router.get("/compraventa", getCompraVentaMensual);

export default router;
