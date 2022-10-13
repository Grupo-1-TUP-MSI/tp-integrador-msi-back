import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "./usuario.controller";
const router = Router();

router.get("/", getUsuarios);
router.get("/:id", getUsuario);
router.post("/", [verifyToken, isAdmin], createUsuario);
router.put("/:id", [verifyToken, isAdmin], updateUsuario);
router.delete("/:id", [verifyToken, isAdmin], deleteUsuario);

export default router;
