// require('dotenv').config();
import express from "express";
import cors from "cors";
import morgan from "morgan";

import pruebaRoutes from "./modules/prueba/prueba.routes";
import usuarioRoutes from "./modules/usuarios/usuario.routes";
import authRoutes from "./modules/auth/auth.routes";
import productoRoutes from "./modules/productos/producto.routes";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.get("/", (req, res) => res.send("Hello World!"));

app.use("/prueba", pruebaRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/auth", authRoutes);
app.use("/productos", productoRoutes);


export default app;