import { PrismaClient } from "@prisma/client";
import { encryptPassword, matchPassword } from '../auth/auth.controller'
import { calcularPlazoEntrega, ordenarCompraVentaMensual } from "../../utils/helpers";
const prisma = new PrismaClient();

const getStock = async (req, res) => {
  try {
    const data = await prisma.$queryRaw
      `select distinct  p.id, p.nombre 
      from notasdepedido n 
      inner join detallenp d on n.id = d.idnp 
      inner join productosxproveedores pp on pp.id = d.idproductoproveedor 
      inner join productos p on p.id = pp.idproducto
      where p.stock < p.stockminimo and not (n.idestadonp=2)
      limit 5;`;

    res.status(200).json({ data, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener stock', status: 400 });
  } finally {
    await prisma.$disconnect();
  }
}

const getPendienteEntrega = async (req, res) => {
  try {
    // traer solo 5 resultados
    const data = await prisma.notasdepedido.findMany({
      where: {
        idestadonp: 2
      },
      include: {
        proveedores: true,
      },
      take: 5
    });

    const np = [];
    data.forEach(nota => {
      const { id, version, vencimiento, proveedores:{nombre}, idtipocompra } = nota;
      const fechaHoy = new Date();
      const demora = calcularPlazoEntrega(fechaHoy, vencimiento);
      np.push({ id, version, demora, proveedor: nombre, idtipocompra });
    });

    res.status(200).json({ data: np, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener notas de pedido pendientes de entrega', status: 400 });
  } finally {
    await prisma.$disconnect();
  }
}

const getCompraVentaMensual = async (req, res) => {
  try {
    const dataCompras = await prisma.notasdepedido.findMany({
      where: {
        idestadonp: 3
      },
      include: {
        detallenp: true
      },
      orderBy: {
        fecha: 'asc',
      }
    });

    let resultado = {
      compras: [],
      ventas: [],
      meses: []
    }

    dataCompras.forEach(nota => {
      const { fecha, detallenp } = nota;
      const fechaNota = new Date(fecha);
      const mes = fechaNota.getMonth() + 1;
      // const anio = fechaNota.getFullYear();
      // const mesAnio = `${mes}-${anio}`;
      const total = detallenp.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidadpedida), 0);
      const index = resultado.meses.findIndex(m => m === mes);
      if (index === -1) {
        resultado.meses.push(mes);
        resultado.compras.push(total);
        resultado.ventas.push(0);
      }
      else {
        resultado.compras[index] += total;
        resultado.ventas[index] += 0;
      }
    });

    const dataVentas = await prisma.facturas.findMany({
      where: {
        estado: true
      },
      include: {
        detallefactura: true
      },
      orderBy: {
        fecha: 'asc',
      }
    });

    dataVentas.forEach(factura => {
      const { fecha, detallefactura, descuento } = factura;
      const fechaFactura = new Date(fecha);
      const mes = fechaFactura.getMonth() + 1;
      // const anio = fechaFactura.getFullYear();
      // const mesAnio = `${mes}-${anio}`;
      const total = detallefactura.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0);
      const descuentoAplicado = total * (descuento / 100); 
      const totalFinal = total - descuentoAplicado;
      const index = resultado.meses.findIndex(m => m === mes);
      if (index === -1) {
        resultado.meses.push(mes);
        resultado.ventas.push(totalFinal);
      }
      else {
        resultado.ventas[index] += totalFinal;
      }
    });

    ordenarCompraVentaMensual(resultado);
    res.status(200).json( resultado );
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener compras y ventas mensuales', status: 400 });
  } finally {
    await prisma.$disconnect();
  }
}

const getPieCharts = async (req, res) => {
  try {
    const anioActual = new Date().getFullYear();

    const compras = await prisma.notasdepedido.findMany({
      where: {
        idestadonp: 3
      },
      include: {
        detallenp: true
      }
    });
    
    const ventas = await prisma.facturas.findMany({
      where: {
        estado: true
      },
      include: {
        detallefactura: true
      }
    });

    // Solucionar con Array Methods
    // const comprasMonto = compras.map(nota => {
    //   const { detallenp } = nota;
    //   const tipoCompra = nota.idtipocompra;
    //   const total = detallenp.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidadpedida), 0);
    //   return { idtipocompra: tipoCompra, total };
    // });

    const comprasMonto = [];
    compras.forEach(nota => {
      const { idtipocompra, fecha, detallenp } = nota;
      const anio = new Date(fecha).getFullYear();
      if(anio === anioActual) {
        const total = detallenp.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidadpedida), 0); 
        const index = comprasMonto.findIndex(c => c.idTipo === idtipocompra); 
        if (index === -1) { 
          comprasMonto.push({ idTipo: idtipocompra, value: total }); 
        } else { 
          comprasMonto[index].value += total;
        }
      }
    });

    const comprasCantidad = [];
    compras.forEach(nota => {
      const { idtipocompra, fecha, detallenp } = nota;
      const anio = new Date(fecha).getFullYear();
      if(anio === anioActual) {
        const cantidad = detallenp.reduce((acc, item) => acc + item.cantidadpedida, 0);
        const index = comprasCantidad.findIndex(c => c.idTipo === idtipocompra);
        if (index === -1) {
          comprasCantidad.push({ idTipo: idtipocompra, value: cantidad });
        } else {
          comprasCantidad[index].value += cantidad;
        }
      }
    });
    
    const ventasMonto = [];
    ventas.forEach(factura => {
      const { idtipoventa, fecha, detallefactura, descuento } = factura;
      const anio = new Date(fecha).getFullYear();
      if(anio === anioActual) {
        const total = detallefactura.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0);
        const descuentoAplicado = total * (descuento / 100);
        const totalFinal = total - descuentoAplicado;
        const index = ventasMonto.findIndex(v => v.idTipo === idtipoventa);
        if (index === -1) {
          ventasMonto.push({ idTipo: idtipoventa, value: totalFinal });
        } else {
          ventasMonto[index].value += totalFinal;
        }
      }
    });
    
    const ventasCantidad = [];
    ventas.forEach(factura => {
      const { idtipoventa, fecha, detallefactura } = factura;
      const anio = new Date(fecha).getFullYear();
      if(anio === anioActual) {
        const cantidad = detallefactura.reduce((acc, item) => acc + item.cantidad, 0);
        const index = ventasCantidad.findIndex(v => v.idTipo === idtipoventa);
        if (index === -1) {
          ventasCantidad.push({ idTipo: idtipoventa, value: cantidad });
        } else {
          ventasCantidad[index].value += cantidad;
        }
      }
    });

    res.status(200).json({ comprasMonto, comprasCantidad, ventasMonto, ventasCantidad });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener compras y ventas mensuales', status: 400 });
  } finally {
    await prisma.$disconnect();
  }
}

export {
  getStock,
  getPendienteEntrega,
  getCompraVentaMensual,
  getPieCharts
}

// const data = await prisma.$queryRaw
    //   `SELECT np.id, np.version, pv.nombre, np.idtipocompra
    //   FROM notasdepedido np
    //   INNER JOIN proveedores pv ON np.idproveedor = pv.id
    //   WHERE np.idestadonp = 2
    //   ;`