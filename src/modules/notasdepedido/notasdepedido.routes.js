import { Router } from "express";
import { verifyToken, isAdmin, isComprador } from "../../middlewares";
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
router.post("/", [verifyToken, isComprador], createNP);
router.put("/estado/:idNotaPedido", [verifyToken, isComprador], cambiarEstadoNP);
router.put("/:idNotaPedido", [verifyToken, isComprador], updateNP);


export default router;