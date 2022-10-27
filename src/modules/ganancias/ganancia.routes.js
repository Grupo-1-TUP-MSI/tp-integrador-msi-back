import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getGanancias,
  createGanancia,
} from "./ganancias.controller";
const router = Router();

router.get("/", getGanancias);
router.post("/", [verifyToken, isAdmin], createGanancia);


export default router;