require('dotenv').config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");

var cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());



app.get("/", (req, res) => res.send("Hello World!"));

// app.get('/prueba', (req, res) => {
//   const prisma = new PrismaClient();
//   prisma.prueba.findMany().then((data) => {
//     res.send(data);
//   })
// })


app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
