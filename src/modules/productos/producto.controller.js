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
      const { id, nombre, precio, stock, stockminimo, proveedores:{nombre:proveedor}, estado } = producto;
      productos.push({ id, nombre, precio, stock, stockminimo, proveedor, estado });
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
    const { nombre, precio, stock, stockminimo, proveedores:{nombre:proveedor}, estado } = data;
    res.status(200).json({ data: { id, nombre, precio, stock, stockminimo, proveedor, estado }, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al obtener producto", status: 400 });
  }
}

const createProducto = async (req, res) => {
  
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