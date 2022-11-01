import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    // console.log(token);

    if (!token) return res.status(403).json({ mensaje: "No proporciono Token" });

    const decoded = jwt.verify(token, process.env.SECRET);
    req.userId = decoded.id;
    // console.log(decoded);

    const user = await prisma.usuarios.findUnique({
      where: {
        id: req.userId,
      },
    });
    // console.log(user);
    
    // tomar fecha de expiracion del token y comparar con la fecha actual
    const fechaExpiracion = new Date(decoded.exp * 1000); // fecha de expiracion del token
    const fechaActual = new Date(); // fecha actual
    if (fechaExpiracion < fechaActual) return res.status(401).json({ mensaje: "Token expirado" }); // 401: Unauthorized

    if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "No esta Autorizado!" });
  }
}

const isAdmin = async (req, res, next) => {
  const user = await prisma.usuarios.findUnique({
    where: {
      id: req.userId,
    },
  });
  // console.log(user, 'user encontrado');

  const rolFound = await prisma.roles.findUnique({
    where: {
      id: user.idrol,
    },
  });
  // console.log(rolFound, 'rol encontrado');

  if (rolFound.rol === "ADMINISTRADOR") {
    next();
    return;
  }
  return res.status(403).json({ mensaje: "Requiere Rol de Administrador!" });
}

const isComprador = async (req, res, next) => {
  const user = await prisma.usuarios.findUnique({
    where: {
      id: req.userId,
    },
  });
  // console.log(user, 'user encontrado');

  const rolFound = await prisma.roles.findUnique({
    where: {
      id: user.idrol,
    },
  });
  // console.log(rolFound, 'rol encontrado');

  if (rolFound.rol === "COMPRADOR") {
    next();
    return;
  }
  return res.status(403).json({ mensaje: "Requiere Rol de Comprador!" });
}

const isVendedor = async (req, res, next) => {
  const user = await prisma.usuarios.findUnique({
    where: {
      id: req.userId,
    },
  });
  // console.log(user, 'user encontrado');

  const rolFound = await prisma.roles.findUnique({
    where: {
      id: user.idrol,
    },
  });
  // console.log(rolFound, 'rol encontrado');

  if (rolFound.rol === "VENDEDOR") {
    next();
    return;
  }
  return res.status(403).json({ mensaje: "Requiere Rol de Vendedor!" });
}



export {
  verifyToken,
  isAdmin,
  isComprador,
  isVendedor
}