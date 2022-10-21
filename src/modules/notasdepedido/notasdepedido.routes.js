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
router.put("/estado/:idNotaPedido", cambiarEstadoNP);
router.put("/editar/:idNotaPedido", updateNP);

export default router;