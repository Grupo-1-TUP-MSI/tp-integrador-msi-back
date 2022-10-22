import { PrismaClient } from "@prisma/client";
import { calcularPlazoEntrega, calcularPlazoEntregaFormated } from "../../utils/helpers";
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
            nombrecompleto: true,
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
        usuarios: { nombrecompleto },
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
          estado,
          productosxproveedores: {
            productos: { nombre },
          },
        } = dnp;
        return {
          id,
          cantidadpedida,
          cantidadrecibida,
          estado,
          precio: parseFloat(precio),
          producto: nombre,
        };
      });
      return {
        id,
        fecha,
        version,
        vencimiento,
        plazoentrega: calcularPlazoEntrega(fecha, vencimiento),
        usuario: nombrecompleto,
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
            id: true,
            nombre: true,
          },
        },
        usuarios: {
          select: {
            nombrecompleto: true,
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
      usuarios: { nombrecompleto },
      proveedores: { id: idproveedor, nombre },
      idestadonp,
      idtipocompra,
      detallenp,
    } = data;
    const detalles = detallenp.map((dnp) => {
      const {
        id,
        cantidadpedida,
        precio,
        estado,
        productosxproveedores: {
          productos: { nombre },
        },
      } = dnp;
      return {
        id,
        cantidadpedida,
        estado,
        precio: parseFloat(precio),
        producto: nombre,
      };
    });
    const np = {
      id,
      fecha,
      version,
      plazoentrega: calcularPlazoEntrega(fecha, vencimiento),
      usuario: nombrecompleto,
      idproveedor,
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
    const arregloIdProductoProveedor = await Promise.all(
      detalles.map(async (detalle) => {
        const idProductoProveedor = await prisma.productosxproveedores.findFirst(
          {
            where: {
              idproducto: parseInt(detalle.idproducto),
              idproveedor: parseInt(idProveedor),
            },
          }
        );
        return idProductoProveedor.id;
      })
    );

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
            data: detalles.map( (dnp) => dnp = {
              cantidadpedida: parseInt(dnp.cantidadpedida),
              precio: parseFloat(dnp.precio),
              idproductoproveedor: arregloIdProductoProveedor[detalles.indexOf(dnp)],
              estado: true
            })
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

const cambiarEstadoNP = async (req, res) => {
  const { idNotaPedido } = req.params;
  const { idEstadoNP } = req.body;
  try {
    const data = await prisma.notasdepedido.update({
      where: {
        id: parseInt(idNotaPedido),
      },
      data: {
        estadonp: {
          connect: {
            id: parseInt(idEstadoNP),
          }
        }
      },
    });
    res.status(200).json({ mensaje: "Estado actualizado con exito", status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al cambiar estado de nota de pedido", status: 400 });
  }
}

const updateNP = async (req, res) => {
  const { idNotaPedido } = req.params;
  const { fecha, plazoentrega, idUsuario, idProveedor, idEstadoNP, idTipoCompra, detalles } = req.body;

  const vencimiento = new Date(
    new Date(fecha).setDate(new Date(fecha).getDate() + plazoentrega)
  ).toISOString();

  try {
    const arregloIdProductoProveedor = await Promise.all(
      detalles.map(async (detalle) => {
        console.log(detalle);
        const idProductoProveedor = await prisma.productosxproveedores.findFirst(
          {
            where: {
              idproducto: parseInt(detalle.idProducto),
              idproveedor: parseInt(idProveedor),
            },
          }
        );
        return idProductoProveedor.id;
      })
    );

    const data = await prisma.notasdepedido.update({
      where: {
        id: parseInt(idNotaPedido),
      },
      data: {
        vencimiento,
        idestadonp: parseInt(idEstadoNP),
        idtipocompra: parseInt(idTipoCompra),
        idusuario: parseInt(idUsuario),
        idproveedor: parseInt(idProveedor),
        detallenp: {
          upsert: detalles.map( (dnp) => dnp = {
            where: {
              id: parseInt(dnp.id) || 0,
            },
            create: {
              cantidadpedida: parseInt(dnp.cantidadPedida),
              precio: parseFloat(dnp.precio),
              idproductoproveedor: arregloIdProductoProveedor[detalles.indexOf(dnp)],
              estado: true
            },
            update: {
              cantidadpedida: parseInt(dnp.cantidadPedida),
              precio: parseFloat(dnp.precio),
              idproductoproveedor: arregloIdProductoProveedor[detalles.indexOf(dnp)],
              estado: dnp.estado
            }
          })
        },
      }
    });

    res.status(200).json({ mensaje: 'Nota de pedido actualizada correctamente', status: 200 });
  } catch (error) {
    console.log(error);
    res.status(400).json({ mensaje: "Error al actualizar nota de pedido", status: 400 });
  }
}



const getNPforPDF = async (req, res) => {
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
            direccion: true,
            telefono: true,
            email: true
          },
        },
        usuarios: {
          select: {
            nombrecompleto: true,
          },
        },
        detallenp: {
          include: {
            productosxproveedores: {
              include: {
                productos: {
                  select: {
                    nombre: true,
                    descripcion: true,
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
      usuarios: { nombrecompleto },
      proveedores: { nombre, direccion, telefono, email },
      
      
      detallenp,
    } = data;
    //let dateFormated = `${Days(fecha)}/${Month(fecha)}/${Year(fecha)} ${Hour(fecha)}:${Day(fecha)}:${Second(fecha)}`;
    
    const detalles = detallenp.map((dnp) => {
      
      const {
        id,
        cantidadpedida,
        precio,                     
        productosxproveedores: {
          productos: { nombre, descripcion },
        },
      } = dnp;
      return {
        id,
        cantidadpedida,        
        precio: parseFloat(precio),
        total: parseFloat(precio) * cantidadpedida,
        producto: nombre, descripcion,
      };
    });
    
    let acumTotal = 0;
    let acumIVA   = 0;
    let acumGravado = 0;
    detalles.forEach(element => {

      acumGravado += parseFloat(element.precio) * parseInt(element.cantidadpedida);
      
    });
    acumTotal = acumGravado * 1.21;
    acumIVA   = acumGravado * 0.21;

    //Pasar a formato local
    let fechaLocale = `${fecha.getDay()}/${fecha.getMonth()}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`
    let vencimientoLocale = `${vencimiento.getDay()}/${vencimiento.getMonth()}/${vencimiento.getFullYear()} ${vencimiento.getHours()}:${vencimiento.getMinutes()}:${vencimiento.getSeconds()}`
    // acumTotal = acumTotal.toLocaleString();
    // acumGravado = acumGravado.toLocaleString();
    // acumIVA = acumIVA.toLocaleString();
    const np = {
      id,
      fechaLocale,      
      vencimientoLocale,
      version,      
      usuario: nombrecompleto,
      proveedor: { nombre, direccion, telefono, email },
      detalles,
      acumTotal,
      acumGravado,
      acumIVA
    };
    res.status(200).json({ data: np, status: 200 });
  } catch (error) {
    console.log(error)
    res
      .status(400)
      .json({ mensaje: "Error al obtener nota de pedido para PDF", status: 400 });
  }
}

export { 
  getNPS,
  getNPbyId,
  createNP,
  cambiarEstadoNP,
  updateNP,
  getNPforPDF
};
