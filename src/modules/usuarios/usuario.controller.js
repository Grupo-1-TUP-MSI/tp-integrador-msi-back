import { PrismaClient } from "@prisma/client";
import { encryptPassword } from '../auth/auth.controller'
const prisma = new PrismaClient();

const getUsuarios = async (req, res) => {
  try {
    // const data = await prisma.usuarios.findMany();
    // res.json({ data, status: 200 });
    const usuarios = [];
    const data = await prisma.usuarios.findMany({
      include: {
        roles: true,
      }
    });
    data.forEach(user => {
      const { id, usuario, roles:{rol}, estado } = user;
      usuarios.push({ id, usuario, rol, estado });
    });
    res.status(200).json({ data: usuarios, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener usuarios', status: 400 });
  }
};

const getUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.usuarios.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        roles: true,
      },
    });
    const { usuario, roles:{rol}, estado } = data;
    res.status(200).json({ data: { id, usuario, rol, estado }, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener usuario', status: 400 });
  }
};

const createUsuario = async (req, res) => {
  const { usuario, password, idRol} = req.body;
  try {
    // Mejorar validacion de password
    // Mejorar: Encriptar la contraseña y compararla con la encriptada

    const user = await prisma.usuarios.findFirst({
      where: {
        usuario,
      },
    });

    if (user) {
      return res.status(400).json({ mensaje: 'El usuario ya existe', status: 400 });
    } else {
      const data = await prisma.usuarios.create({
        data: {
          usuario,
          password: await encryptPassword(password),
          estado: true,
          roles: {
            connect: {
              id: parseInt(idRol),
            },
          },
        },
      });
      res.status(200).json({ mensaje: 'Usuario registrado correctamente', status: 200 });
    }
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear usuario', status: 400 });
  }
};

const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { usuario, password, idRol, estado } = req.body;
  try {
    const usuarioFound = await prisma.usuarios.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!usuarioFound) {
      return res.status(400).json({ mensaje: 'El usuario no existe', status: 400 });
    }

    const passwordCompare = await encryptPassword(password, usuarioFound.password);

    if (!passwordCompare) {
      return res.status(400).json({ mensaje: 'La contraseña no coincide', status: 400 });
    }

    const data = await prisma.usuarios.update({
      where: {
        id: parseInt(id),
      },
      data: {
        usuario,
        password: await encryptPassword(password),
        estado: true,
        roles: {
          connect: {
            id: parseInt(idRol),
          },
        },
      },
    });
    res.status(200).json({ mensaje: 'Usuario actualizado correctamente', status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar usuario', status: 400 });
  }
};

const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.usuarios.update({
      where: {
        id: parseInt(id),
      },
      data: {
        estado: false,
      },
    });
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente', status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al eliminar usuario', status: 400 });
  }
};

export {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
}