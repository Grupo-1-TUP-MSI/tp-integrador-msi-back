

const checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  prisma.usuarios
    .findUnique({
      where: {
        usuario: req.body.usuario,
      },
    })
    .then((usuario) => {
      if (usuario) {
        res.status(400).send({
          mensaje: "El usuario ya existe",
        });
        return;
      }
    });

  // Email
  prisma.usuarios
    .findUnique({
      where: {
        email: req.body.email,
      },
    })
    .then((usuario) => {
      if (usuario) {
        res.status(400).send({
          mensaje: "El email ya existe",
        });
        return;
      }
    });

  next();
};

export {
  checkDuplicateUsernameOrEmail
}