import { Router } from "express";
import { verifyToken, isAdmin, isVendedor } from '../../middlewares'
import {
  getClientes,
  createCliente,
  deleteCliente,
  updateCliente,
  getCliente
} from "./cliente.controller";
const router = Router();

router.get("/", getClientes);
router.get("/:id", getCliente);
router.post("/", [verifyToken, isVendedor], createCliente);
router.put("/:id", [verifyToken, isVendedor], updateCliente);
router.delete("/:id", [verifyToken, isAdmin], deleteCliente);

export default router;