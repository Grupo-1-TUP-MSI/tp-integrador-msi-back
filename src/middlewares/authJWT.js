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

  const rolFinded = await prisma.roles.findUnique({
    where: {
      id: user.idrol,
    },
  });
  // console.log(rolFinded, 'rol encontrado');

  if (rolFinded.rol === "ADMINISTRADOR") {
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

  const rolFinded = await prisma.roles.findUnique({
    where: {
      id: user.idrol,
    },
  });
  // console.log(rolFinded, 'rol encontrado');

  if (rolFinded.rol === "COMPRADOR") {
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

  const rolFinded = await prisma.roles.findUnique({
    where: {
      id: user.idrol,
    },
  });
  // console.log(rolFinded, 'rol encontrado');

  if (rolFinded.rol === "VENDEDOR") {
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