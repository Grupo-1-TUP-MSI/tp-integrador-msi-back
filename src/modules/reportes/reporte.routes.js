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
router.get("/compra-venta-mensual", getCompraVentaMensual);

export default router;
