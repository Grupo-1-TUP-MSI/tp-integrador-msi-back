import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getGanancias
} from "./ganancias.controller";
const router = Router();

router.get("/", getGanancias);


export default router;