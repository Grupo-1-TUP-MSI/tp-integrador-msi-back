import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getProductos,
  getProducto,
  getProductosProveedor,
  createProducto,
  updateProducto,
  updateStock,
  updateProductoProveedor,
  deleteProducto
} from "./producto.controller";
const router = Router();

router.get("/", getProductos);
router.get("/:id", getProducto);
router.get("/proveedor/:id", getProductosProveedor);
router.post("/", createProducto);
router.put("/:id", updateProducto);
router.put("/:id/stock", updateStock);
// router.put("/:idProducto/proveedor/:idProveedor", productoProveedor); revisar sintaxis
router.post("/proveedor", updateProductoProveedor);
router.delete("/:id", deleteProducto);

export default router;
