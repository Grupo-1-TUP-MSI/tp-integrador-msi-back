import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getPruebas = async (req, res) => {
  prisma.prueba.findMany().then((data) => {
    res.send(data);
  })
};

const getPrueba = async (req, res) => {
  const { id } = req.params;
  prisma.prueba.findUnique({
    where: {
      id: parseInt(id),
    },
  }).then((data) => {
    res.send(data);
  })
};

const createPrueba = async (req, res) => {
  const getId = () => {
    return Math.floor(Math.random() * 1000000);
  };
  const { nombre } = req.body;
  try {
    const data = await prisma.prueba.create({
      data: {
        id: getId(),
        nombre,
      },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
  }
};

const updatePrueba = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const data = await prisma.prueba.update({
      where: {
        id: parseInt(id),
      },
      data: {
        nombre,
      },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
  }
};

const deletePrueba = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.prueba.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
  }
};

export {
  getPruebas,
  getPrueba,
  createPrueba
}