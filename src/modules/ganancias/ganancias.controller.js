import { PrismaClient } from "@prisma/client";
import { encryptPassword, matchPassword } from '../auth/auth.controller'
const prisma = new PrismaClient();

const getGanancias = async (req, res) => {
  try {
    const data = await prisma.ganancias.findMany({
      include: {
        usuarios: {
          select: {
            usuario: true,
          },
        }
      }
    });

    const respuesta = data.map(ganancia => {
      const { vigencia, porcentaje, idusuario: idUsuario, usuarios:{usuario} } = ganancia;
      return { vigencia, porcentaje, idUsuario, usuario };
    });

    res.status(200).json( respuesta ); 
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener ganancias', status: 400 });
  }
};

export {
  getGanancias,
}