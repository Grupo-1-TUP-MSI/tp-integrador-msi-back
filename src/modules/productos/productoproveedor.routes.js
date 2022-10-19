import { Router } from "express";

import {

  productoProveedor,
  
} from "./producto.controller";
const router = Router();


router.put("/", productoProveedor);


export default router;
