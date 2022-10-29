import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getFacturas,
  createFactura,
  getFactforPDF,
  procesarPago
} from "./factura.controller";
const router = Router();

router.get("/", getFacturas);
router.post("/", [verifyToken], createFactura);
router.get("/pdf/:idFactura", getFactforPDF);
router.post("/preference", procesarPago);

export default router;
