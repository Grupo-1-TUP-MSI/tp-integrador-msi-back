import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getFacturas
} from "./factura.controller";
const router = Router();

router.get("/", getFacturas);

export default router;
