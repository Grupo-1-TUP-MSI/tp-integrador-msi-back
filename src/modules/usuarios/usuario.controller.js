import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getUsuarios = async (req, res) => {
  prisma.usuario.findMany().then((data) => {
    res.send(data);
  })
}

const getUsuario = async (req, res) => {
  const { id } = req.params;
  prisma.usuario.findUnique({
    where: {
      id: parseInt(id),
    },
  }).then((data) => {
    res.send(data);
  })
}

const createUsuario = async (req, res) => {
  const getId = () => {
    return Math.floor(Math.random() * 1000000);
  };
  const { nombre, apellido, email, password } = req.body;
  try {
    const data = await prisma.usuario.create({
      data: {
        id: getId(),
        nombre,
        apellido,
        email,
        password,
      },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
  }
}

const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, password } = req.body;
  try {
    const data = await prisma.usuario.update({
      where: {
        id: parseInt(id),
      },
      data: {
        nombre,
        apellido,
        email,
        password,
      },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
  }
}

const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  // logic delete
  try {
    const data = await prisma.usuario.update({
      where: {
        id: parseInt(id),
      },
      data: {
        deleted: true,
      },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });
    if (data.password === password) {
      res.json(data);
    } else {
      res.json({ message: "Contraseña incorrecta" });
    }
  } catch (error) {
    console.log(error);
  }
}

const signup = async (req, res) => {
  const getId = () => {
    return Math.floor(Math.random() * 1000000);
  };
  const { nombre, apellido, email, password } = req.body;
  try {
    const data = await prisma.usuario.create({
      data: {
        id: getId(),
        nombre,
        apellido,
        email,
        password,
      },
    });
    res.json(data);
  } catch (error) {
    console.log(error);
  }
}

export {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  login,
  signup,
}