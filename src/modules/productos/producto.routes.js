import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  updateStock,
  deleteProducto
} from "./producto.controller";
const router = Router();

router.get("/", getProductos);
router.get("/:id", getProducto);
router.post("/", createProducto);
router.put("/:id", updateProducto);
router.put("/:id/stock", updateStock);
router.delete("/:id", deleteProducto);

export default router;
