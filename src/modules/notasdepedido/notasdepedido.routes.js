import { Router } from "express";

import {
  getNPS,
  getNPbyId,
  createNP
} from "./notasdepedido.controller";
const router = Router();

router.get("/", getNPS);
router.get("/:idNotaPedido", getNPbyId);
router.post("/", createNP);

export default router;