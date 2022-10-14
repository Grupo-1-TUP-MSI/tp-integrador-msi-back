import { Router } from "express";
//import { verifyToken, isAdmin } from '../../middlewares'
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
router.post("/", createCliente);
router.put("/:id", updateCliente);
router.delete("/:id",  deleteCliente);

export default router;