import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getUsuarios = async (req, res) => {
  try {
    const data = await prisma.usuarios.findMany();
    res.json({ data, status: 200 });
  } catch (error) {
    res.json({ mensaje: 'Error al obtener usuarios', status: 400 });
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
    res.json({ mensaje: 'Error al obtener usuario', status: 400 });
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
    res.json({ mensaje: 'Usuario registrado correctamente', status: 200 });
  } catch (error) {
    res.json({ mensaje: 'Error al crear usuario', status: 400 });
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
        estado: true
      },
    });
    res.json({ mensaje: 'Usuario actualizado correctamente', status: 200 });
  } catch (error) {
    res.json({ mensaje: 'Error al actualizar usuario', status: 400 });
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
    res.json({ mensaje: 'Usuario eliminado correctamente', status: 200 });
  } catch (error) {
    res.json({ mensaje: 'Error al eliminar usuario', status: 400 });
  }
};

const login = async (req, res) => {
  console.log(req.body);
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
    res.json({ mensaje: 'Error al iniciar sesión', status: 400 });
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