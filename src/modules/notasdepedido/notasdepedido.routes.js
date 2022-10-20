import { Router } from "express";

import {
  getNPS,
  getNPbyId
} from "./notasdepedido.controller";
const router = Router();

router.get("/", getNPS);
router.get("/:idNotaPedido", getNPbyId);

export default router;