import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
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
            idproducto,
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
          idproducto
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
  }finally {
    await prisma.$disconnect();
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
          idproducto,
          productos: { nombre },
        },
      } = dnp;
      return {
        id,
        cantidadpedida,
        estado,
        precio: parseFloat(precio),
        producto: nombre,
        idproducto
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
  }finally {
    await prisma.$disconnect();
  }
}

const createNP = async (req, res) => {
  console.log(req.body);
  const { plazoentrega, idproveedor, idtipocompra, detalles } = req.body;

  // La validacion del Token se hace en el middleware de verifyToken
  const token = req.header("x-access-token");
  const tokenDecoded = jwt.verify(token, process.env.SECRET);
  const { id } = tokenDecoded;
  const idusuario = id;

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
              idproveedor: parseInt(idproveedor),
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
        idtipocompra: parseInt(idtipocompra),
        idusuario: idusuario,
        idproveedor: parseInt(idproveedor),
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
  }finally {
    await prisma.$disconnect();
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

    // descontar stock
    if (idEstadoNP == 3) {
      const np = await prisma.notasdepedido.findUnique({
        where: {
          id: parseInt(idNotaPedido),
        },
        include: {
          detallenp: {
            include: {
              productosxproveedores: {
                include: {
                  productos: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const detalles = np.detallenp.map((dnp) => {
        const {
          id,
          cantidadpedida,
          precio,
          estado,
          productosxproveedores: {
            productos: { id: idproducto },
          },
        } = dnp;
        return {
          id,
          cantidadpedida,
          estado,
          precio: parseFloat(precio),
          idproducto,
        };
      });
      detalles.forEach(async (detalle) => {
        const producto = await prisma.productos.findUnique({
          where: {
            id: detalle.idproducto,
          },
        });
        const stock = producto.stock + detalle.cantidadpedida;
        await prisma.productos.update({
          where: {
            id: detalle.idproducto,
          },
          data: {
            stock,
          },
        });
      });
    }

    res.status(200).json({ mensaje: "Estado actualizado con exito", status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al cambiar estado de nota de pedido", status: 400 });
  }finally {
    await prisma.$disconnect();
  }
}

const updateNP = async (req, res) => {
  const { idNotaPedido } = req.params;
  const { plazoentrega, idproveedor, idtipocompra, detalles } = req.body;

  try {
    const obtenerNotaPedido = await prisma.notasdepedido.findUnique({
      where: {
        id: parseInt(idNotaPedido),
      },
      select: {
        fecha: true,
      }
    });

    const vencimiento = new Date(
      new Date(obtenerNotaPedido.fecha).setDate(new Date(obtenerNotaPedido.fecha).getDate() + plazoentrega)
    ).toISOString();

    const arregloIdProductoProveedor = await Promise.all(
      detalles.map(async (detalle) => {
        console.log(detalle.idproducto);
        console.log(idproveedor);
        const idProductoProveedor = await prisma.productosxproveedores.findFirst(
          {
            where: {
              idproducto: parseInt(detalle.idproducto),
              idproveedor: parseInt(idproveedor),
            },
          }
        );
        console.log(idProductoProveedor)
        return idProductoProveedor.id;
      })
    );

    // <!-- Dejar para revision -->
    // const data = await prisma.notasdepedido.update({
    //   where: {
    //     id: parseInt(idNotaPedido),
    //   },
    //   data: {
    //     vencimiento,
    //     idestadonp: parseInt(idestadonp),
    //     idproveedor: parseInt(idproveedor),
    //     idtipocompra: parseInt(idtipocompra),
    //     detallenp: {
    //       upsert: detalles.map( (dnp) => dnp = {
    //         where: {
    //           id: parseInt(dnp.id) || 0,
    //         },
    //         create: {
    //           cantidadpedida: parseInt(dnp.cantidadPedida),
    //           precio: parseFloat(dnp.precio),
    //           idproductoproveedor: arregloIdProductoProveedor[detalles.indexOf(dnp)],
    //           estado: true
    //         },
    //         update: {
    //           cantidadpedida: parseInt(dnp.cantidadPedida),
    //           precio: parseFloat(dnp.precio),
    //           idproductoproveedor: arregloIdProductoProveedor[detalles.indexOf(dnp)],
    //           estado: dnp.estado
    //         }
    //       })
    //     },
    //   }
    // });

    const data = await prisma.notasdepedido.update({
      where: {
        id: parseInt(idNotaPedido),
      },
      data: {
        vencimiento,
        idproveedor: parseInt(idproveedor),
        idtipocompra: parseInt(idtipocompra),
        detallenp: {
          deleteMany: {
            idnp: parseInt(idNotaPedido),
          },
          create: detalles.map( (dnp) => dnp = {
            cantidadpedida: parseInt(dnp.cantidadPedida),
            precio: parseFloat(dnp.precio),
            idproductoproveedor: arregloIdProductoProveedor[detalles.indexOf(dnp)],
          })
        },
      }
    });

    res.status(200).json({ data, mensaje: 'Nota de pedido actualizada correctamente', status: 200 });
  } catch (error) {
    console.log(error);    
    res.status(400).json({ mensaje: "Error al actualizar nota de pedido", status: 400 });
  }finally {
    await prisma.$disconnect();
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
    let fechaLocale = fecha.toLocaleString();//`${fecha.getDay()}/${fecha.getMonth()}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`
    let vencimientoLocale = vencimiento.toLocaleString();`${vencimiento.getDay()}/${vencimiento.getMonth()}/${vencimiento.getFullYear()} ${vencimiento.getHours()}:${vencimiento.getMinutes()}:${vencimiento.getSeconds()}`

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
    
    res
      .status(400)
      .json({ mensaje: "Error al obtener nota de pedido para PDF", status: 400 });
  }finally {
    await prisma.$disconnect();
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
