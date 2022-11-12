import { PrismaClient } from "@prisma/client";
import { encryptPassword, matchPassword } from "../auth/auth.controller";
import {
  calcularPlazoEntrega,
  ordenarCompraVentaMensual,
} from "../../utils/helpers";
const prisma = new PrismaClient();

const getStock = async (req, res) => {
  try {
    const data = await prisma.$queryRaw`select distinct  p.id, p.nombre 
      from notasdepedido n 
      inner join detallenp d on n.id = d.idnp 
      inner join productosxproveedores pp on pp.id = d.idproductoproveedor 
      inner join productos p on p.id = pp.idproducto
      where p.stock < p.stockminimo and not (n.idestadonp=2)
      limit 5;`;

    res.status(200).json({ data, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al obtener stock", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};

const getPendienteEntrega = async (req, res) => {
  try {
    // traer solo 5 resultados
    const data = await prisma.notasdepedido.findMany({
      where: {
        idestadonp: 2,
      },
      include: {
        proveedores: true,
      },
      take: 5,
    });

    const np = [];
    data.forEach((nota) => {
      const {
        id,
        version,
        vencimiento,
        proveedores: { nombre },
        idtipocompra,
      } = nota;
      const fechaHoy = new Date();
      const demora = calcularPlazoEntrega(fechaHoy, vencimiento);
      np.push({ id, version, demora, proveedor: nombre, idtipocompra });
    });

    res.status(200).json({ data: np, status: 200 });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al obtener notas de pedido pendientes de entrega",
      status: 400,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const getCompraVentaMensual = async (req, res) => {
  try {
    const desde =
      req.query.desde !== "null"
        ? new Date(req.query.desde)
        : new Date().setDate(new Date().getDay() - 30);
    const hasta =
      req.query.hasta !== "null" ? new Date(req.query.hasta) : new Date();

    let resultado = {
      compras: [],
      ventas: [],
      dias: [],
    };

    // Add days between desde and hasta to array
    for (let d = desde; d <= hasta; d.setDate(d.getDate() + 1)) {
      resultado.dias.push(new Date(d));
      resultado.compras.push(0);
      resultado.ventas.push(0);
    }

    const dataCompras = await prisma.notasdepedido.findMany({
      where: {
        idestadonp: 3,
        fecha: {
          gte: new Date(req.query.desde),
          lte: new Date(req.query.hasta),
        },
      },
      include: {
        detallenp: true,
      },
      orderBy: {
        fecha: "asc",
      },
    });

    dataCompras.forEach((nota) => {
      const { fecha, detallenp } = nota;
      const fechaNota = new Date(fecha);
      fechaNota.setUTCHours(0, 0, 0, 0);

      const total = detallenp.reduce(
        (acc, item) => acc + parseFloat(item.precio) * item.cantidadpedida,
        0
      );

      // If date exists in array, add total to resultado.compras array
      if (resultado.dias.find((dia) => dia.getTime() === fechaNota.getTime())) {
        resultado.compras[
          resultado.dias.findIndex(
            (dia) => dia.getTime() === fechaNota.getTime()
          )
        ] += total;
      }
    });

    const dataVentas = await prisma.facturas.findMany({
      where: {
        estado: true,
        fecha: {
          gte: new Date(req.query.desde),
          lte: new Date(req.query.hasta),
        },
      },
      include: {
        detallefactura: true,
      },
      orderBy: {
        fecha: "asc",
      },
    });

    dataVentas.forEach((factura) => {
      const { fecha, detallefactura, descuento } = factura;
      const fechaFactura = new Date(fecha);
      fechaFactura.setUTCHours(0, 0, 0, 0);

      const total = detallefactura.reduce(
        (acc, item) => acc + parseFloat(item.precio) * item.cantidad,
        0
      );
      const descuentoAplicado = total * (descuento / 100);
      const totalFinal = total - descuentoAplicado;

      // If date exists in array, add total to resultado.ventas array
      if (
        resultado.dias.find((dia) => dia.getTime() === fechaFactura.getTime())
      ) {
        resultado.ventas[
          resultado.dias.findIndex(
            (dia) => dia.getTime() === fechaFactura.getTime()
          )
        ] += totalFinal;
      }
    });

    resultado.dias = resultado.dias.map((dia) => dia.toLocaleDateString());

    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al obtener compras y ventas mensuales",
      status: 400,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const getPieCharts = async (req, res) => {
  try {
    const compras = await prisma.notasdepedido.findMany({
      where: {
        idestadonp: 3,
        fecha: {
          gte: new Date(req.query.desde),
          lte: new Date(req.query.hasta),
        },
      },
      include: {
        detallenp: true,
      },
    });

    const ventas = await prisma.facturas.findMany({
      where: {
        estado: true,
        fecha: {
          gte: new Date(req.query.desde),
          lte: new Date(req.query.hasta),
        },
      },
      include: {
        detallefactura: true,
      },
    });

    console.log("Compras seleccionadas: ", compras.length);
    console.log("Ventas seleccionadas: ", ventas.length);

    const tiposCompraPorMonto = [];

    tiposCompraPorMonto.push(
      {
        idTipo: 1,
        value: compras.reduce((acc, nota) => {
          if (nota.idtipocompra === 1) {
            acc += nota.detallenp.reduce(
              (acc, item) =>
                acc + parseFloat(item.precio) * item.cantidadpedida,
              0
            );
          }
          return acc;
        }, 0),
      },
      {
        idTipo: 2,
        value: compras.reduce((acc, nota) => {
          if (nota.idtipocompra === 2) {
            acc += nota.detallenp.reduce(
              (acc, item) =>
                acc + parseFloat(item.precio) * item.cantidadpedida,
              0
            );
          }
          return acc;
        }, 0),
      }
    );

    const tiposVentasMonto = [];

    tiposVentasMonto.push(
      {
        idTipo: 1,
        value: ventas.reduce((acc, factura) => {
          if (factura.idtipoventa === 1) {
            acc += factura.detallefactura.reduce(
              (acc, item) => acc + parseFloat(item.precio) * item.cantidad,
              0
            );
          }
          return acc;
        }, 0),
      },
      {
        idTipo: 2,
        value: ventas.reduce((acc, factura) => {
          if (factura.idtipoventa === 2) {
            acc += factura.detallefactura.reduce(
              (acc, item) => acc + parseFloat(item.precio) * item.cantidad,
              0
            );
          }
          return acc;
        }, 0),
      }
    );

    const tiposComprasCantidad = [];

    tiposComprasCantidad.push(
      {
        idTipo: 1,
        value: compras.reduce((acc, nota) => {
          if (nota.idtipocompra === 1) {
            acc += 1;
          }
          return acc;
        }, 0),
      },
      {
        idTipo: 2,
        value: compras.reduce((acc, nota) => {
          if (nota.idtipocompra === 2) {
            acc += 1;
          }
          return acc;
        }, 0),
      }
    );

    const tiposVentasCantidad = [];

    tiposVentasCantidad.push(
      {
        idTipo: 1,
        value: ventas.reduce((acc, factura) => {
          if (factura.idtipoventa === 1) {
            acc += factura.detallefactura.reduce((acc, item) => acc + 1, 0);
          }
          return acc;
        }, 0),
      },
      {
        idTipo: 2,
        value: ventas.reduce((acc, factura) => {
          if (factura.idtipoventa === 2) {
            acc += factura.detallefactura.reduce((acc, item) => acc + 1, 0);
          }
          return acc;
        }, 0),
      }
    );

    res.status(200).json({
      comprasMonto: tiposCompraPorMonto,
      comprasCantidad: tiposComprasCantidad,
      ventasMonto: tiposVentasMonto,
      ventasCantidad: tiposVentasCantidad,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al obtener compras y ventas mensuales",
      status: 400,
    });
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

export { getStock, getPendienteEntrega, getCompraVentaMensual, getPieCharts };

// const data = await prisma.$queryRaw
//   `SELECT np.id, np.version, pv.nombre, np.idtipocompra
//   FROM notasdepedido np
//   INNER JOIN proveedores pv ON np.idproveedor = pv.id
//   WHERE np.idestadonp = 2
//   ;`
