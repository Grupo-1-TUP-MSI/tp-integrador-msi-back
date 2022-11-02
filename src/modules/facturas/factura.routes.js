import { Router } from "express";
import { verifyToken, isAdmin, isVendedor } from '../../middlewares'
import {
  getFacturas,
  createFactura,
  getFactforPDF
} from "./factura.controller";
const router = Router();

router.get("/", getFacturas);
router.post("/", [verifyToken, isVendedor], createFactura);
router.get("/pdf/:idFactura", getFactforPDF);

export default router;
