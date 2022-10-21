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

const getPendienteEntrega = async (req, res) => {
  try {
    const data = await prisma.notasdepedido.findMany({
      where: {
        idestadonp: 2
      },
      include: {
        proveedores: true,
      },
    });

    const np = [];
    data.forEach(nota => {
      const { id, version, proveedores:{nombre}, idtipocompra } = nota;
      np.push({ id, version, proveedor: nombre, idtipocompra });
    });

    res.status(200).json({ data: np, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener notas de pedido pendientes de entrega', status: 400 });
  }
}

export {
  getStock,
  getPendienteEntrega
}

// const data = await prisma.$queryRaw
    //   `SELECT np.id, np.version, pv.nombre, np.idtipocompra
    //   FROM notasdepedido np
    //   INNER JOIN proveedores pv ON np.idproveedor = pv.id
    //   WHERE np.idestadonp = 2
    //   ;`