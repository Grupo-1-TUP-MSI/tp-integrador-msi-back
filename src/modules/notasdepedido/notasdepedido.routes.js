import { Router } from "express";

import {
  getNPS,
  getNPbyId,
  createNP,
  cambiarEstadoNP,
  updateNP,
  getNPforPDF
  
} from "./notasdepedido.controller";
const router = Router();

router.get("/", getNPS);
router.get("/:idNotaPedido", getNPbyId);
router.get("/pdf/:idNotaPedido", getNPforPDF);
router.post("/", createNP);
router.put("/estado/:idNotaPedido", cambiarEstadoNP);
router.put("/:idNotaPedido", updateNP);


export default router;