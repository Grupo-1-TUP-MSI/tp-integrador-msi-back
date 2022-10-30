import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares';
import {
  getProveedores,
  getProveedor,
  createProveedor,
  updateProveedor,
  deleteProveedor
  
  
} from "./proveedor.controller";
const router = Router();

router.get("/", getProveedores);
router.get("/:id", getProveedor);
router.post("/", createProveedor);
router.put("/:id", updateProveedor);
router.delete("/:id", deleteProveedor);


export default router;
