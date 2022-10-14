import { Router } from "express";
//import { verifyToken, isAdmin } from '../../middlewares'
import {
  getClientes,
  createCliente,
  deleteCliente
} from "./cliente.controller";
const router = Router();

router.get("/", getClientes);
// router.get("/:id", getUsuario);
router.post("/", createCliente);
// router.put("/:id", [verifyToken, isAdmin], updateUsuario);
router.delete("/:id",  deleteCliente);

export default router;