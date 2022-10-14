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
    if(idtipodocumento == 0, documento == 0 ,tipoiva == 0 || nombre == "" || direccion == "" || cp == "" || email == ""){
        return res.status(400).json({ mensaje: 'Debe cargar todos los campos requeridos', status: 400 });
    }
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

    const deleteCliente = async (req, res) => {
        const { id } = req.params;
        try {
          const data = await prisma.clientes.update({
            where: {
              id: parseInt(id),
            },
            data: {
              estado: false,
            },
          });
          res.status(200).json({ mensaje: 'Cliente eliminado correctamente', status: 200 });
        } catch (error) {
          res.status(400).json({ mensaje: 'Error al eliminar cliente', status: 400 });
        }
      };

      const updateCliente = async (req, res) => {
        const { id } = req.params;
        const { nombre, tipoiva, direccion, cp, telefono, email } = req.body;
        if(tipoiva == 0 || nombre == "" || direccion == "" || cp == "" || email == ""){
            return res.status(400).json({ mensaje: 'Debe cargar todos los campos requeridos', status: 400 });
        }
        try {
          const clienteFound = await prisma.clientes.findUnique({
            where: {
              id: parseInt(id),
            },
          });
      
          if (!clienteFound) {
            return res.status(400).json({ mensaje: 'El cliente no existe', status: 400 });
          }
      
          const data = await prisma.clientes.update({
            where: {
              id: parseInt(id),
            },
            data: {
              nombre,
              tipoiva: parseInt(tipoiva),           
              direccion,
              cp,
              telefono,
              email,
              estado: true,
              
            },
          });
          res.status(200).json({ mensaje: 'Cliente actualizado correctamente', status: 200 });
        } catch (error) {
            console.log(error)
          res.status(400).json({ mensaje: 'Error al actualizar Cliente', status: 400 });
        }
      }


      const getCliente = async (req, res) => {
        try {
          const { id } = req.params;
          const data = await prisma.clientes.findUnique({
            where: {
              id: parseInt(id),
            }
          });
          const { nombre, tipoiva, idtipodocumento, documento, direccion, cp, telefono, email, estado } = data;
          res.status(200).json({ data: { nombre, tipoiva, idtipodocumento, documento, direccion, cp, telefono, email, estado }, status: 200 });
        } catch (error) {
          res.status(400).json({ mensaje: "Error al obtener cliente", status: 400 });
        }
      }

export {
    getClientes,
    createCliente,
    deleteCliente,
    updateCliente,
    getCliente
    }