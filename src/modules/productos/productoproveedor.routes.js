import { Router } from "express";

import {

  updateProductoProveedor,
  
} from "./producto.controller";
const router = Router();


router.put("/", updateProductoProveedor);


export default router;
