import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getProductos = async (req, res) => {
  try {
    const data = await prisma.productos.findMany();
    const ganancia = await prisma.ganancias.findFirst({
      orderBy: {
        vigencia: 'desc'
      }
    });

    const productos = []
    data.forEach(producto => {
      const { id, nombre, descripcion, preciolista, stock, stockminimo, estado } = producto;
      const precioLista = parseFloat(preciolista);
      const porcentaje = parseFloat(ganancia.porcentaje);
      const precioVenta = precioLista + (precioLista * porcentaje / 100);
      productos.push({ id, nombre, descripcion, preciolista: precioLista, precioVenta, stock, stockminimo, estado });
    });
    res.status(200).json({ data: productos, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al obtener productos", status: 400 });
  }
};

const getProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.productos.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    const { nombre, descripcion, preciolista, stock, stockminimo, estado } = data;
    res.status(200).json({ data: { id, nombre, descripcion, preciolista, stock, stockminimo, estado }, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al obtener producto", status: 400 });
  }
}

const getProductosProveedor = async (req, res) => {
  try {
    const { id } = req.params; // id del proveedor
    const data = await prisma.productosxproveedores.findMany({
      where: {
        idproveedor: parseInt(id),
        precio: {
          gt: 0
        }
      },
      include: {
        productos: {
          select: {
            id: true,
            nombre: true,
            estado: true
          }
          // solucionar where estado true
        }
      }
    });

    const productos = []
    data.forEach(p => {
      const { idproducto, precio } = p;
      if(p.productos.estado){
        productos.push({ idproducto, precio, productoNombre: p.productos.nombre });
      }
    });
    res.status(200).json({ data: productos, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al obtener productos", status: 400 });
  }
    
}

const createProducto = async (req, res) => {
  const { nombre, descripcion, preciolista, stockminimo } = req.body;
  try {
    const data = await prisma.productos.create({
      data: {
        nombre,
        descripcion,
        preciolista: parseFloat(preciolista),
        stockminimo: parseInt(stockminimo),
        estado: true
      },
    });
    res.status(200).json({ mensaje: "Producto creado correctamente", status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear producto", status: 400 });
  }
}

const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, preciolista, stockminimo } = req.body;
  try {
    const productoFound = await prisma.productos.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!productoFound) {
      return res.status(400).json({ mensaje: 'El producto no existe', status: 400 });
    }

    const data = await prisma.productos.update({
      where: {
        id: parseInt(id),
      },
      data: {
        nombre,
        descripcion,
        preciolista: parseFloat(preciolista),
        stockminimo: parseInt(stockminimo),
        estado: true
      },
    });
    res.status(200).json({ mensaje: 'Producto actualizado correctamente', status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar producto', status: 400 });
  }
}

const updateProductoProveedor = async (req, res) => {
  //const { id } = req.params;
  const { idproducto, idproveedor, precio } = req.body;

  try {
    
    const dataFound = await prisma.productosxproveedores.findFirst({
      where: {
        idproducto: parseInt(idproducto),
        idproveedor: parseInt(idproveedor),
      },
    });

    if (dataFound) {
      const data = await prisma.productosxproveedores.updateMany({
        where: {
          idproducto: parseInt(idproducto),
          idproveedor: parseInt(idproveedor),
        },
        data: {
          precio: parseFloat(precio),
        },
      });
      return res.status(200).json({ mensaje: 'Precio actualizado correctamente', status: 200 });
    } 

    const data = await prisma.productosxproveedores.create({
      data: {
        idproducto: parseInt(idproducto),
        idproveedor: parseInt(idproveedor),
        precio: parseFloat(precio),
      },
    });
    return res.status(200).json({ mensaje: 'Precio creado correctamente', status: 200 });

  } catch (error) {
    console.log(error);
    return res.status(400).json({ mensaje: 'Error al actualizar producto', status: 400 });
  }
}

const updateStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  try {
    const productoFound = await prisma.productos.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!productoFound) {
      return res.status(400).json({ mensaje: 'El producto no existe', status: 400 });
    }

    const data = await prisma.productos.update({
      where: {
        id: parseInt(id),
      },
      data: {
        stock: parseInt(stock),
      },
    });
    res.status(200).json({ mensaje: 'Stock actualizado correctamente', status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar stock', status: 400 });
  }
}

const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.productos.update({
      where: {
        id: parseInt(id),
      },
      data: {
        estado: false,
      },
    });
    res.status(200).json({ mensaje: 'Producto eliminado correctamente', status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al eliminar producto', status: 400 });
  }
}

export {
  getProductos,
  getProducto,
  getProductosProveedor,
  createProducto,
  updateProducto,
  updateStock,
  updateProductoProveedor,
  deleteProducto
}