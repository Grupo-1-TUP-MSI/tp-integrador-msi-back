import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getPruebas = async (req, res) => {
  const pruebas = await prisma.prueba.findMany();
  res.json(pruebas);
};

const getPrueba = async (req, res) => {
  const { id } = req.params;
  try {
    const prueba = await prisma.prueba.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    res.json(prueba);
  } catch (error) {
    res.json({ data: null, status: 404 });
  }
};

const createPrueba = async (req, res) => {
  const getId = () => {
    return Math.floor(Math.random() * 1000000);
  };
  const { nombre, estado, apellido, telefono } = req.body;

  try {
    const prueba = await prisma.prueba.create({
      data: {
        id: getId(),
        nombre,
        estado,
        apellido,
        telefono,
      },
    });
    res.json(prueba);
  } catch (error) {
    res.json({ data: null, status: 404 });
  }
}

const updatePrueba = async (req, res) => {
  const { id } = req.params;
  const { nombre, estado, apellido, telefono } = req.body;
  try {
    const prueba = await prisma.prueba.update({
      where: {
        id: parseInt(id),
      },
      data: {
        nombre,
        estado,
        apellido,
        telefono,
      },
    });
    res.json(prueba);
  } catch (error) {
    res.json({ data: null, status: 404 });
  }
};

const deletePrueba = async (req, res) => {
  const { id } = req.params;
  try {
    const prueba = await prisma.prueba.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json(prueba);
  } catch (error) {
    res.json({ data: null, status: 404 });
  }
};

export {
  getPruebas,
  getPrueba,
  createPrueba,
  updatePrueba,
  deletePrueba,
}