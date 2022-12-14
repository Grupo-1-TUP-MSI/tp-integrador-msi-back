import { PrismaClient } from "@prisma/client";
import { encryptPassword, matchPassword } from "../auth/auth.controller";
import jwt from "jsonwebtoken";
import {
  calcularPlazoEntrega,
  ordenarCompraVentaMensual,
} from "../../utils/helpers";
import { mercadoPago } from "../../utils/mercadoPago";
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
          },
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
              },
            },
          },
        },
      },
      orderBy: {
        fecha: "desc",
      }
    });

    const facturas = data.map((factura) => {
      const {
        id,
        fecha,
        usuarios: { nombrecompleto: usuario },
        clientes: { id: idCliente, nombre: cliente },
        idtipoventa,
        detallefactura,
      } = factura;
      const detalles = detallefactura.map((item) => {
        const {
          id,
          cantidad,
          precio,
          productos: { nombre: producto },
        } = item;
        return { id, cantidad, precio: parseFloat(precio), producto };
      });
      return {
        id,
        fecha,
        usuario,
        idCliente,
        cliente,
        idTipoVenta: idtipoventa,
        detalles,
      };
    });

    res.status(200).json(facturas);
  } catch (error) {
    res.status(400).json("Error al obtener las facturas");
  } finally {
    await prisma.$disconnect();
  }
};

const createFactura = async (req, res) => {
  const token = req.header("x-access-token");
  const tokenDecoded = jwt.verify(token, process.env.SECRET);
  const { id } = tokenDecoded;

  const { fecha, idCliente, idTipoVenta, idTipoPago, descuento, detalles } =
    req.body;
  try {
    const ultimaFactura = await prisma.facturas.findFirst({
      select: {
        fecha: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    const fechaNuevaFactura = new Date(fecha); // fecha de la nueva factura
    if(ultimaFactura) {
      const fechaUltimaFactura = new Date(ultimaFactura.fecha); // fecha de la ??ltima factura
      if (fechaUltimaFactura > fechaNuevaFactura) {
        return res
          .status(400)
          .json(
            "La fecha de la factura no puede ser menor a la fecha de la ??ltima factura"
          );
      }
    }

    // console.log("fechaUltimaFactura", fechaUltimaFactura); // 2021-07-01T00:00:00.000Z
    // console.log("fechaNuevaFactura", fechaNuevaFactura); // 2021-07-01T00:00:00.000Z

    const data = await prisma.facturas.create({
      data: {
        fecha: fechaNuevaFactura,
        idusuario: parseInt(id), // id del usuario que est?? creando la factura
        idcliente: parseInt(idCliente), // id del cliente que est?? comprando
        idtipoventa: parseInt(idTipoVenta), // id del tipo de venta (contado, cr??dito) 1 = contado, 2 = cr??dito
        idtipopago: parseInt(idTipoPago), // id del tipo de pago (efectivo, tarjeta, transferencia) 1 = efectivo, 2 = tarjeta, 3 = transferencia
        descuento: parseFloat(descuento), // descuento de la factura
        estado: true,
        detallefactura: {
          createMany: {
            data: detalles.map(
              (df) =>
                (df = {
                  cantidad: parseInt(df.cantidad),
                  precio: parseFloat(df.precio),
                  idproducto: parseInt(df.idProducto),
                })
            ),
          },
        },
      },
    });

    if (data) {
      await prisma.$transaction(
        detalles.map((item) => {
          const { idProducto, cantidad } = item;
          return prisma.productos.update({
            where: {
              id: idProducto,
            },
            data: {
              stock: {
                decrement: cantidad,
              },
            },
          });
        })
      );
    }

    // #region Pagos con Mercado Pago
    console.log("LLEGA ACA", idTipoPago);
    if (parseInt(idTipoPago) === 2) {
      console.log("llega aca");
      const preference = crearPreferencia(req, data.id);
      const mp = await mercadoPago.preferences.create(preference);

      return res.json(mp.body.init_point);
    }

    res.status(200).json(data); // id de la factura creada
  } catch (error) {
    console.log(error);
    res.status(400).json("Error al crear la factura");
  } finally {
    await prisma.$disconnect();
  }
};

const calculoDescuento = (precio, descuento) => {
  return precio - precio * (descuento / 100);
};

const crearPreferencia = (factura, id) => {
  const { idCliente, descuento, detalles } = factura.body;
  const clientUrl = factura.headers.referer;
  const cliente = prisma.clientes.findUnique({
    where: {
      id: idCliente,
    },
  });

  const preference = {
    items: detalles.map((item) => {
      const { idProducto, cantidad, precio } = item;
      const producto = prisma.productos.findUnique({
        where: {
          id: idProducto,
        },
      });

      return {
        title: producto.nombre,
        descripcion: producto.descripcion || "",
        unit_price: calculoDescuento(precio, descuento) * 1.21,
        quantity: cantidad,
      };
    }),
    back_urls: {
      success: `${clientUrl}ventas/facturacion/pago-exitoso/${id}`,
      failure: `${clientUrl}ventas/facturacion/alta`,
      pending: `${clientUrl}ventas/facturacion/alta`,
    },
    auto_return: "approved",
    payment_methods: {
      excluded_payment_methods: [
        {
          id: "amex",
        },
      ],
      excluded_payment_types: [
        {
          id: "atm",
        },
      ],
      installments: 6,
    },
    payer: {
      name: cliente.nombrecompleto,
      email: cliente.email,
    },
  };

  return preference;
};

const getFactforPDF = async (req, res) => {
  const { idFactura } = req.params;
  try {
    const data = await prisma.facturas.findUnique({
      where: {
        id: parseInt(idFactura),
      },
      include: {
        clientes: {
          select: {
            nombre: true,
            direccion: true,
            telefono: true,
            email: true,
          },
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
                descripcion: true,
              },
            },
          },
        },
      },
    });
    const {
      id,
      fecha,
      numero,
      usuarios: { nombrecompleto },
      clientes: { nombre, direccion, telefono, email },
      detallefactura,
    } = data;

    const detalles = detallefactura.map((df) => {
      const {
        id,
        cantidad,
        precio,
        productos: { nombre, descripcion },
      } = df;
      return {
        id,
        cantidad,
        precio: parseFloat(precio),
        total: parseFloat(precio) * cantidad,
        producto: nombre,
        descripcion,
      };
    });

    let acumTotal = 0;
    let acumIVA = 0;
    let acumGravado = 0;
    detalles.forEach((element) => {
      acumGravado += parseFloat(element.precio) * parseInt(element.cantidad);
    });
    acumTotal = acumGravado * 1.21;
    acumIVA = acumGravado * 0.21;

    //Pasar a formato local, tomar?? el formato de heroku mm/DD/yyyy
    console.log(data);
    console.log(fecha);
    let fechaLocale = fecha.toLocaleString();

    const fact = {
      id,
      fechaLocale,
      numero,
      usuario: nombrecompleto,
      cliente: { nombre, direccion, telefono, email },
      detalles,
      acumTotal,
      acumGravado,
      acumIVA,
    };
    res.status(200).json({ data: fact, status: 200 });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ mensaje: "Error al obtener factura para PDF", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};

export { getFacturas, createFactura, getFactforPDF };
