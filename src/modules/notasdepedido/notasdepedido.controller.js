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

const createNP = async (req, res) => {
  console.log(req.body);
  const { plazoentrega, idUsuario, idProveedor, idTipoCompra, detalles } = req.body;
  // const fecha = new Date().toISOString().split("T")[0];
  // fecha en formato datetime
  const fecha = new Date().toISOString();
  const vencimiento = new Date(
    new Date().setDate(new Date().getDate() + plazoentrega)
  ).toISOString();
  console.log(`Fecha: ${fecha} - Vencimiento: ${vencimiento}`);

  try {
    const obtenerProductoProveedor = await prisma.productosxproveedores.findFirst({
      where: {
        idproducto: 1,
        idproveedor: parseInt(idProveedor),
      },
      select: {
        id: true,
      },
    })

    const data = await prisma.notasdepedido.create({
      data: {
        fecha,
        version: 1,
        vencimiento,
        idestadonp: 1,
        idtipocompra: parseInt(idTipoCompra),
        idusuario: parseInt(idUsuario),
        idproveedor: parseInt(idProveedor),
        detallenp: {
          createMany: {
            data: detalles.map((dnp) => dnp = {
              cantidadpedida: parseInt(dnp.cantidadpedida),
              precio: parseFloat(dnp.precio),
              idproductoproveedor: 1
            }),
            skipDuplicates: true,
          }
        },
      }
    });
    res.status(200).json({ data, status: 200 });
  } catch (error) {
    console.log(error);
    res.status(400).json({ mensaje: "Error al crear nota de pedido", status: 400 });
  }
}

export { 
  getNPS,
  getNPbyId,
  createNP
};
