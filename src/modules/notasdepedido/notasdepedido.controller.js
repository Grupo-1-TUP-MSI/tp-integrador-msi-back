import { PrismaClient } from "@prisma/client";
import { calcularPlazoEntrega } from "../../utils/helpers";
const prisma = new PrismaClient();

const getNPS = async (req, res) => {
  try {
    const data = await prisma.notasdepedido.findMany({
      include: {
        proveedores: {
          select: {
            nombre: true,
          },
        },
        usuarios: {
          select: {
            usuario: true,
          },
        },
        detallenp: {
          include: {
            productosxproveedores: {
              include: {
                productos: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const nps = data.map((np) => {
      const {
        id,
        fecha,
        version,
        vencimiento,
        usuarios: { usuario },
        proveedores: { nombre },
        idestadonp,
        idtipocompra,
        detallenp,
      } = np;
      const detalles = detallenp.map((dnp) => {
        const {
          id,
          cantidadpedida,
          cantidadrecibida,
          precio,
          productosxproveedores: {
            productos: { nombre },
          },
        } = dnp;
        return {
          id,
          cantidadpedida,
          cantidadrecibida,
          precio: parseFloat(precio),
          producto: nombre,
        };
      });
      return {
        id,
        fecha,
        version,
        vencimiento,
        usuario,
        proveedor: nombre,
        idestadonp,
        idtipocompra,
        detalles,
      };
    });

    res.status(200).json({ data: nps, status: 200 });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al obtener notas de pedido", status: 400 });
  }
};

const getNPbyId = async (req, res) => {
  const { idNotaPedido } = req.params;
  try {
    const data = await prisma.notasdepedido.findUnique({
      where: {
        id: parseInt(idNotaPedido),
      },
      include: {
        proveedores: {
          select: {
            nombre: true,
          },
        },
        usuarios: {
          select: {
            usuario: true,
          },
        },
        detallenp: {
          include: {
            productosxproveedores: {
              include: {
                productos: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const {
      id,
      fecha,
      version,
      vencimiento,
      usuarios: { usuario },
      proveedores: { nombre },
      idestadonp,
      idtipocompra,
      detallenp,
    } = data;
    const detalles = detallenp.map((dnp) => {
      const {
        id,
        cantidadpedida,
        precio,
        productosxproveedores: {
          productos: { nombre },
        },
      } = dnp;
      return {
        id,
        cantidadpedida,
        precio: parseFloat(precio),
        producto: nombre,
      };
    });
    const np = {
      id,
      fecha,
      version,
      plazoentrega: calcularPlazoEntrega(fecha, vencimiento),
      usuario,
      proveedor: nombre,
      idestadonp,
      idtipocompra,
      detalles,
    };
    res.status(200).json({ data: np, status: 200 });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al obtener nota de pedido", status: 400 });
  }
}

export { 
  getNPS,
  getNPbyId
};
