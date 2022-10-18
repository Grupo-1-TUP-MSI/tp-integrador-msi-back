import { Router } from "express";
import { verifyToken, isAdmin } from '../../middlewares'
import {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  updateStock,
  productoProveedor,
  deleteProducto
} from "./producto.controller";
const router = Router();

router.get("/", getProductos);
router.get("/:id", getProducto);
router.post("/", createProducto);
router.put("/:id", updateProducto);
router.put("/:id/stock", updateStock);
// router.put("/:idProducto/proveedor/:idProveedor", productoProveedor); revisar sintaxis
router.post("/proveedor", productoProveedor);
router.delete("/:id", deleteProducto);

export default router;
