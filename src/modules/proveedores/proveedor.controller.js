import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getProveedores = async (req, res) => {
  try {
    const data = await prisma.proveedores.findMany({
      // where: {
      //   estado: true,
      // },
    });

    const proveedores = [];
    data.forEach((proveedor) => {
      const {
        id,
        nombre,
        tipoiva,
        idtipodocumento,
        documento,
        direccion,
        cp,
        telefono,
        email,
        estado,
      } = proveedor;
      proveedores.push({
        id,
        nombre,
        tipoiva,
        idtipodocumento,
        documento,
        direccion,
        cp,
        telefono,
        email,
        estado,
      });
    });
    res.status(200).json({ data: proveedores, status: 200 });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al obtener proveedores", status: 400 });
  }
};

const getProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.proveedores.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    const {
      nombre,
      tipoiva,
      idtipodocumento,
      documento,
      direccion,
      cp,
      telefono,
      email,
      estado,
    } = data;
    res
      .status(200)
      .json({
        data: {
          id,
          nombre,
          tipoiva,
          idtipodocumento,
          documento,
          direccion,
          cp,
          telefono,
          email,
          estado,
        },
        status: 200,
      });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al obtener proveedor", status: 400 });
  }
};

const createProveedor = async (req, res) => {
  const {
    nombre,
    tipoiva,
    idtipodocumento,
    documento,
    direccion,
    cp,
    telefono,
    email,
  } = req.body;
  if (
    nombre == "" ||
    tipoiva == 0 ||
    idtipodocumento == 0 ||
    documento == 0 ||
    direccion == "" ||
    cp == "" ||
    email == ""
  ) {
    return res
      .status(400)
      .json({
        mensaje: "Es necesario ingresar todos los campos requeridos",
        status: 400,
      });
  }

  try {
    const data = await prisma.proveedores.create({
      data: {
        nombre,
        documento,
        direccion,
        cp,
        telefono,
        email,
        estado: true,
        tipodocumentos: {
          connect: {
            id: parseInt(idtipodocumento),
          },
        },
        tiposiva: {
          connect: {
            id: parseInt(tipoiva),
          },
        },
      },
    });
    res
      .status(200)
      .json({ mensaje: "Proveedor registrado correctamente", status: 200 });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al crear el proveedor", status: 400 });
  }
};

const updateProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, cp, telefono, email, estado } = req.body;

  if (nombre == "" || direccion == "" || cp == "" || email == "") {
    return res
      .status(400)
      .json({
        mensaje: "Es necesario ingresar todos los campos requeridos",
        status: 400,
      });
  }

  try {
    const data = await prisma.proveedores.update({
      where: {
        id: parseInt(id),
      },
      data: {
        nombre,
        direccion,
        cp,
        telefono,
        email,
        estado: true,
      },
    });
    res
      .status(200)
      .json({ mensaje: "Proveedor actualizado correctamente", status: 200 });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al actualizar el proveedor", status: 400 });
  }
};

const deleteProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    // logic delete
    const data = await prisma.proveedores.update({
      where: {
        id: parseInt(id),
      },
      data: {
        estado: false,
      },
    });
    res
      .status(200)
      .json({ mensaje: "Proveedor eliminado correctamente", status: 200 });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al eliminar proveedor", status: 400 });
  }
};

export {
  getProveedores,
  getProveedor,
  createProveedor,
  updateProveedor,
  deleteProveedor,
};
