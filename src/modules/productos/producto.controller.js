import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getProductos = async (req, res) => {
  try {
    const data = await prisma.productos.findMany({
      where: {
        estado: true,
      },
      include: {
        proveedores: true,
      },
    });

    const productos = []
    data.forEach(producto => {
      // tomar por separdo nombre de producto y nombre de proveedor
      const { id, nombre, precio, stock, stockminimo, proveedores:{id: idProveedor, nombre:proveedor}, estado } = producto;
      productos.push({ id, nombre, precio, stock, stockminimo, idProveedor, proveedor, estado });
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
      include: {
        proveedores: true,
      },
    });
    const { nombre, precio, stock, stockminimo, proveedores:{id: idProveedor, nombre:proveedor}, estado } = data;
    res.status(200).json({ data: { id, nombre, precio, stock, stockminimo, idProveedor, proveedor, estado }, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al obtener producto", status: 400 });
  }
}

const createProducto = async (req, res) => {
  const { nombre, descripcion, precio, stockminimo, idProveedor } = req.body;
  try {
    const data = await prisma.productos.create({
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        stockminimo: parseInt(stockminimo),
        estado: true,
        proveedores: {
          connect: {
            id: parseInt(idProveedor),
          },
        },
      },
    });
    res.status(200).json({ mensaje: "Producto creado correctamente", status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear producto", status: 400 });
  }
}

const updateProducto = async (req, res) => {

}

const deleteProducto = async (req, res) => {

}

export {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto
}