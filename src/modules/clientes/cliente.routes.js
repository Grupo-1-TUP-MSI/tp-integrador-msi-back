import { Router } from "express";
//import { verifyToken, isAdmin } from '../../middlewares'
import {
  getClientes,
} from "./cliente.controller";
const router = Router();

router.get("/", getClientes);
// router.get("/:id", getUsuario);
// router.post("/", [verifyToken, isAdmin], createUsuario);
// router.put("/:id", [verifyToken, isAdmin], updateUsuario);
// router.delete("/:id", [verifyToken, isAdmin], deleteUsuario);

export default router;