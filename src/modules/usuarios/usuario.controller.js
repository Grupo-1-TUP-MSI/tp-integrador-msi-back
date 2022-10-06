import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getUsuarios = async (req, res) => {
  try {
    const data = await prisma.usuarios.findMany();
    res.json({ data, status: 200 });
  } catch (error) {
    res.json({ data: null, status: 404 });
  }
};

const getUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.usuarios.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    res.json({ data, status: 200 });
  } catch (error) {
    res.json({ data: null, status: 404 });
  }
};

const createUsuario = async (req, res) => {
  const { usuario, password, idRol} = req.body;
  try {
    // Mejorar validacion de password
    // Mejorar: Encriptar la contraseña y compararla con la encriptada
    const data = await prisma.usuarios.create({
      data: {
        usuario,
        password,
        idRol,
        estado: true,
      },
    });
    res.json({ data, status: 200 });
  } catch (error) {
    res.json({ data: null, status: 404 });
  }
};

const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { usuario, password, idRol, estado } = req.body;
  try {
    const data = await prisma.usuarios.update({
      where: {
        id: parseInt(id),
      },
      data: {
        usuario,
        password,
        idRol,
        estado,
      },
    });
    res.json({ data, status: 200 });
  } catch (error) {
    res.json({ data: null, status: 404 });
  }
};

const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    // logic delete
    const data = await prisma.usuarios.update({
      where: {
        id: parseInt(id),
      },
      data: {
        estado: false,
      },
    });
    res.json({ data, status: 200 });
  } catch (error) {
    res.json({ data: null, status: 404 });
  }
};

const login = async (req, res) => {
  const { usuario, password } = req.body;
  // Mejorar: Encriptar la contraseña y compararla con la encriptada
  try {
    const data = await prisma.usuarios.findFirst({
      where: {
        usuario,
        password,
        estado: true,
      },
    });
    res.json({ data, status: 200 });
  } catch (error) {
    res.json({ data: null, status: 404 });
  }
};

export {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  login,
}