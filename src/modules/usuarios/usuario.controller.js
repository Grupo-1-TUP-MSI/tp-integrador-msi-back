import { PrismaClient } from "@prisma/client";
import { encryptPassword, matchPassword } from '../auth/auth.controller'
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
      const { id, usuario, roles:{rol}, estado, nombrecompleto } = user;
      usuarios.push({ id, usuario, nombrecompleto, rol, estado });
    });
    res.status(200).json({ data: usuarios, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener usuarios', status: 400 });
  }finally {
    await prisma.$disconnect();
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
    const { usuario, roles:{rol}, nombrecompleto, estado } = data;
    res.status(200).json({ data: { id, usuario, rol, nombrecompleto, estado }, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener usuario', status: 400 });
  }finally {
    await prisma.$disconnect();
  }
};

const createUsuario = async (req, res) => {
  const { usuario, password, nombrecompleto, idRol } = req.body;
  try {

    if(parseInt(idRol) === 1) return res.status(400).json({ mensaje: 'No se puede crear un usuario con rol de administrador', status: 400 });

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
          nombrecompleto,
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
  }finally {
    await prisma.$disconnect();
  }
};

const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { usuario, password, nombrecompleto, idRol, estado } = req.body;
  try {
    const usuarioFound = await prisma.usuarios.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!usuarioFound) {
      return res.status(400).json({ mensaje: 'El usuario no existe', status: 400 });
    }

    const data = await prisma.usuarios.update({
      where: {
        id: parseInt(id),
      },
      data: {
        usuario,
        password: await encryptPassword(password),
        nombrecompleto,
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
  }finally {
    await prisma.$disconnect();
  }
};

const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  const token = req.headers['x-access-token'];
  
  try {
    const decoded = await verifyToken(token);
    if (decoded.id === parseInt(id)) return res.status(400).json({ mensaje: 'No se puede eliminar el usuario actual', status: 400 });

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
  }finally {
    await prisma.$disconnect();
  }
};

export {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
}