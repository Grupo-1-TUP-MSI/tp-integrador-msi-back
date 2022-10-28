import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getFacturas,
  getFactforPDF
} from "./factura.controller";
const router = Router();

router.get("/", getFacturas);
router.get("/pdf/:idFactura", getFactforPDF);

export default router;
