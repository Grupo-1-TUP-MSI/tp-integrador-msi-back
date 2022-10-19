import { Router } from "express";

import {
  getNPS
} from "./notasdepedido.controller";
const router = Router();

router.get("/", getNPS);

export default router;