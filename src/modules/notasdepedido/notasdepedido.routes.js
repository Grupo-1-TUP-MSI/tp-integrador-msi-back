import { Router } from "express";

import {
  getNPS,
  getNPbyId,
  createNP,
  cambiarEstadoNP,
  updateNP
} from "./notasdepedido.controller";
const router = Router();

router.get("/", getNPS);
router.get("/:idNotaPedido", getNPbyId);
router.post("/", createNP);
router.put("/estado/:id", cambiarEstadoNP);
router.put("/editar/:id", updateNP);

export default router;