import { PrismaClient } from "@prisma/client";
import { encryptPassword } from '../auth/auth.controller'
const prisma = new PrismaClient();

const getClientes = async (req, res) => {
  try {

    const clientes = [];
    const data = await prisma.clientes.findMany({
  
    });
    data.forEach(client => {
      const { id, nombre, tipoiva, idtipodocumento, documento, direccion, cp, telefono, email, estado } = client;
      clientes.push({ id, nombre, tipoiva, idtipodocumento, documento, direccion, cp, telefono, email, estado });
    });
    res.status(200).json({ data: clientes, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al obtener clientes', status: 400 });
  }
};


const createCliente = async (req, res) => {
    
    const { nombre, tipoiva, idtipodocumento, documento, direccion, cp, telefono, email} = req.body;
    try {

  

        const data = await prisma.clientes.create({
          data: {
            nombre,
            tiposiva: {
                connect: {
                    id: parseInt(tipoiva)
                }
            },
            tipodocumentos: {
                connect: {
                    id: parseInt(idtipodocumento)
                }
            },
            documento,
            direccion,
            cp,
            telefono,
            email,
            estado: true
            },          
        });
        res.status(200).json({ mensaje: 'Cliente registrado correctamente', status: 200 });
        
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear cliente', status: 400 });
    }
    };





export {
    getClientes,
    createCliente,
    }