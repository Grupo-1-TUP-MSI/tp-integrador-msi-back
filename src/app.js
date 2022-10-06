// require('dotenv').config();
import express from "express";
import cors from "cors";
import morgan from "morgan";

import pruebaRoutes from "./modules/prueba/prueba.routes";
import usuarioRoutes from "./modules/usuarios/usuario.routes";

const app = express();

app.use(cors());
app.use(morgan("dev"));



app.get("/", (req, res) => res.send("Hello World!"));

app.use("/prueba", pruebaRoutes);
app.use("/usuario", usuarioRoutes);


export default app;