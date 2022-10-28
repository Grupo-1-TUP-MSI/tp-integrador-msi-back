import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { encryptPassword, matchPassword } from "../auth/auth.controller";
import {
  calcularPlazoEntrega,
  ordenarCompraVentaMensual,
} from "../../utils/helpers";
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
  }
};

const createFactura = async (req, res) => {
  const token = req.header('x-access-token');
  const tokenDecoded = jwt.verify(token, process.env.SECRET);
  const { id } = tokenDecoded;

  const {
    fecha,
    idCliente,
    idTipoVenta,
    descuento,
    detalles,
  } = req.body;
  try {
    
    const data = await prisma.facturas.create({
      data: {
        fecha,
        idcliente: idCliente,
        idtipoventa: idTipoVenta,
        descuento,
        idusuario: id,
        detallefactura: {
          create: detalles.map((item) => {
            const { idProducto, cantidad, precio } = item;
            return {
              idproducto: idProducto,
              cantidad,
              precio,
            };
          }),
        },
      },
    });

    res.status(200).json('Factura creada correctamente');
  } catch (error) {
    res.status(400).json("Error al crear la factura");
  }
}

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
            email: true
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
        producto: nombre, descripcion,
      };
    });
    
    let acumTotal = 0;
    let acumIVA   = 0;
    let acumGravado = 0;
    detalles.forEach(element => {

      acumGravado += parseFloat(element.precio) * parseInt(element.cantidad);
      
    });
    acumTotal = acumGravado * 1.21;
    acumIVA   = acumGravado * 0.21;

    //Pasar a formato local, tomará el formato de heroku mm/DD/yyyy
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
      acumIVA
    };
    res.status(200).json({ data: fact, status: 200 });
  } catch (error) {
    console.log(error)
    res
      .status(400)
      .json({ mensaje: "Error al obtener factura para PDF", status: 400 });
  }
}

export { 
  getFacturas,
  createFactura,
  getFactforPDF 
};