import { Router } from "express";
import { verifyToken, isAdmin, isComprador } from '../../middlewares'
import {
  getProductos,
  getProducto,
  getProductosProveedor,
  createProducto,
  updateProducto,
  updateStock,
  updateProductoProveedor,
  deleteProducto,
  getComparativa
} from "./producto.controller";
const router = Router();

router.get("/", getProductos);
router.get("/comparativa", getComparativa);
router.get("/:id", getProducto);
router.get("/proveedor/:id", getProductosProveedor);
router.post("/", [verifyToken, isComprador], createProducto);
router.put("/:id", [verifyToken, isComprador], updateProducto);
router.put("/:id/stock", [verifyToken, isComprador], updateStock);
// router.put("/:idProducto/proveedor/:idProveedor", productoProveedor); revisar sintaxis
router.post("/proveedor", [verifyToken, isComprador], updateProductoProveedor);
router.delete("/:id", [verifyToken, isAdmin],deleteProducto);

export default router;
