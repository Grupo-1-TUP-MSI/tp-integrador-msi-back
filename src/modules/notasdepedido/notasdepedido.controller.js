import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getNPS = async (req, res) => {
  try {
    // const data = await prisma.notasdepedido.findMany({
    //     include:{
    //         detallenp: true,
    //         usuarios: true,
    //         proveedores: {
    //             include:{
    //                 nombrecompleto,
    //                 productosxproveedores: {
    //                     include: prod
    //                 }
    //             }
    //         }
    //     }
    // });
    
    const data = await prisma.$queryRaw`SELECT np.id
	,np.fecha
	,np.version
	,np.vencimiento
	,u.nombrecompleto
	,p.nombre AS productonombre
	,np.idestadonp
	,np.idtipocompra
	,dnp.id
	,p.nombre
	,dnp.cantidadpedida
	,dnp.cantidadrecibida
	,dnp.precio
FROM notasdepedido np
INNER JOIN detallenp dnp ON np.id = dnp.idnp
INNER JOIN usuarios u ON np.idusuario = u.id
INNER JOIN proveedores p ON np.idproveedor = p.id
INNER JOIN productosxproveedores pxp ON pxp.idproveedor = p.id
INNER JOIN productos pr ON pr.id = pxp.idproducto`

    const nps = []
    data.forEach(np => {
      const { id, fecha, version, vencimiento, usuarios:{nombrecompleto}, proveedores:{nombre}, idestadonp, idtipocompra, detallenp:{ idNp, productonombre, cantidadpedidad, cantidadrecibida, precio } } = np;
      nps.push({ id, fecha, version, vencimiento, usuarios:{nombrecompleto}, proveedores:{nombre}, idestadonp, idtipocompra, detallenp:{ idNp, productonombre, cantidadpedidad, cantidadrecibida, precio } });
    });
    res.status(200).json({ data: nps, status: 200 });
  } catch (error) {
    console.log(error)
    res.status(400).json({ mensaje: "Error al obtener notas de pedido", status: 400 });
  }
};


export {
    getNPS,

  }