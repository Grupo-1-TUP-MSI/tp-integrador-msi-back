import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getStock,
  getPendienteEntrega,
  getCompraVentaMensual,
  getPieCharts
} from "./reporte.controller";
const router = Router();

router.get("/stock", getStock);
router.get("/np/pde", getPendienteEntrega);
router.get("/compraventa", getCompraVentaMensual);
router.get("/pie-charts", getPieCharts); 

export default router;
