import { PrismaClient } from "@prisma/client";
import { encryptPassword, matchPassword } from '../auth/auth.controller'
const prisma = new PrismaClient();

const getStock = async (req, res) => {
  try {
    const data = await prisma.$queryRaw
      `SELECT p.id, p.nombre 
      FROM productos p
      INNER JOIN productosxproveedores pp ON p.id = pp.idproducto
      INNER JOIN detallenp dp ON pp.id = dp.idproductoproveedor
      INNER JOIN notasdepedido np ON dp.idnp = np.id
      WHERE 
        p.stock < p.stockminimo
        AND NOT(np.idestadonp = 2)
      ;`

    res.status(200).json({ data, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener stock', status: 400 });
  }
}

export {
  getStock,
}