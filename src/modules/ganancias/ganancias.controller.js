import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { encryptPassword, matchPassword } from '../auth/auth.controller'
const prisma = new PrismaClient();

const getGanancias = async (req, res) => {
  try {
    const data = await prisma.ganancias.findMany({
      include: {
        usuarios: {
          select: {
            nombrecompleto: true,
          },
        }
      },
      orderBy: {
        vigencia: 'desc',
      },
    });

    const respuesta = data.map(ganancia => {
      const { vigencia, porcentaje, idusuario: idUsuario, usuarios:{nombrecompleto} } = ganancia;
      return { vigencia, porcentaje, idUsuario, usuario: nombrecompleto };
    });

    res.status(200).json( respuesta ); 
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener ganancias', status: 400 });
  }
};

const createGanancia = async (req, res) => {
  const token = req.header('x-access-token');
  const tokenDecoded = jwt.verify(token, process.env.SECRET);
  const { id } = tokenDecoded;

  try {
    const { vigencia, porcentaje } = req.body;

    const ultimaVigencia = await prisma.ganancias.findFirst({
      orderBy: {
        vigencia: 'desc',
      },
    });

    const fechaUltimaVigencia = new Date(ultimaVigencia.vigencia);
    const fechaVigencia = new Date(vigencia);
    const diferencia = fechaVigencia - fechaUltimaVigencia;
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if(dias <= 1) {
      return res.status(400).json({ mensaje: 'La vigencia debe ser mayor a la última vigencia registrada por 1 día', status: 400 });
    }

    const data = await prisma.ganancias.create({
      data: {
        vigencia: new Date(vigencia),
        porcentaje,
        idusuario: id,
      },
    });
    res.status(200).json({ mensaje: 'Ganancia creada correctamente', status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear ganancia', status: 400 });
  }
}

export {
  getGanancias,
  createGanancia,
}