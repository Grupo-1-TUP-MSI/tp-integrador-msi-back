import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getNPS = async (req, res) => {
  try {
    const data = await prisma.notasdepedido.findMany({
        include:{
            detallenp: true,
            usuarios: true,
            proveedores: {
                include:{
                    productosxproveedores: {
                        include:{productos:true}
                    }
                }
            }
        }
    });
    


    const nps = []

     data.forEach(np=>{
            const detalles = []
            np.detallenp.forEach(det=>{
                const {id, nombre, cantidadpedida, cantidadrecibida, precio}  = det;
                detalles.push({id, nombre, cantidadpedida, cantidadrecibida, precio })
            })
          const { id, fecha, version, vencimiento, usuarios:{nombrecompleto}, proveedores:{nombre},idestadonp, idtipocompra } = np;
          nps.push({ id, fecha, version, vencimiento, nombrecompleto, nombre, idestadonp, idtipocompra, detalles});
     })
    res.status(200).json({ data: nps, status: 200 });
  } catch (error) {
    
    res.status(400).json({ mensaje: "Error al obtener notas de pedido", status: 400 });
  }
};


export {
    getNPS,

  }