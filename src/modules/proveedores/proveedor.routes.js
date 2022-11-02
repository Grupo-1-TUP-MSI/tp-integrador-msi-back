import { Router } from "express";
import { verifyToken, isAdmin, isComprador } from '../../middlewares';
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
router.post("/", [verifyToken, isComprador], createProveedor);
router.put("/:id", [verifyToken, isComprador], updateProveedor);
router.delete("/:id", [verifyToken, isAdmin], deleteProveedor);


export default router;
