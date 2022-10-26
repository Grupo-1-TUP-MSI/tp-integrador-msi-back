import { PrismaClient } from "@prisma/client";
import { encryptPassword, matchPassword } from '../auth/auth.controller'
import { calcularPlazoEntrega, ordenarCompraVentaMensual } from "../../utils/helpers";
const prisma = new PrismaClient();

const getFacturas = async (req, res) => {
  // res.status(200).json(await prisma.facturas.findMany());
  try {
    const data = await prisma.facturas.findMany({
      include: {
        clientes: {
          select: {
            id: true,
            nombre: true,
          }
        },
        usuarios: {
          select: {
            nombrecompleto: true,
          },
        },
        detallefactura: {
          include: {
            productos: {
              select: {
                nombre: true,
              }
            }
          },
        }
      },
    });

    const facturas = data.map(factura => {
      const { id, fecha, usuarios: { nombrecompleto: usuario }, clientes: { id: idCliente, nombre:cliente }, idtipoventa, detallefactura } = factura;
      const detalle = detallefactura.map(item => {
        const { id, cantidad, precio, productos: { nombre: producto } } = item;
        return { id, cantidad, precio: parseFloat(precio), producto };
      });
      return { id, fecha, usuario, idCliente, cliente, idTipoVenta: idtipoventa, detalle };
    });

    res.status(200).json(facturas);
  } catch (error) {
    res.status(400).json('Error al obtener las facturas');
  }
}

export {
  getFacturas
}