const { ValidationError, UniqueConstraintError } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const privateKey = require("../auth/private_key");
const { Admin } = require("../db/sequelize");

module.exports = (app) => {
  //S'inscrire
  app.post("/api/adminSignup", async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const admin = await Admin.create({
        emailAddress: req.body.emailAddress,
        password: hashedPassword,
      });

      const message = `Création de compte administrateur réussie`;
      res.json({ message, data: admin });
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof UniqueConstraintError
      ) {
        return res.status(400).json({ message: error.message });
      }
      const errorMessage = `L'administrateur n'a pas pu être créé. Réessayer dans quelques instants.`;
      res.status(500).json({ message: errorMessage, data: error });
    }
  });

  //Se connecter

  app.post("/api/adminLogin", (req, res) => {
    Admin.findOne({ where: { emailAddress: req.body.emailAddress } })
      .then((admin) => {
        if (!admin) {
          const message = `Ce compte administrateur n'existe pas .Créer un compte ou réessayer une autre adresse email`;
          return res.status(404).json({ message });
        }
        bcrypt
          .compare(req.body.password, admin.password)
          .then((isPasswordValid) => {
            if (!isPasswordValid) {
              const message = `Le mot de passe est incorrect.`;
              return res.status(401).json({ message });
            }
            const token = jwt.sign({ userId: admin.id }, privateKey, {
              expiresIn: "365d",
            });
            Admin.update({ fcmToken: token }, { where: { id: admin.id } }).then(
              (_) => {
                const message = `Connexion administrateur réussie.`;
                return res.json({ message, data: admin, token });
              }
            );
          });
      })
      .catch((error) => {
        const message = `L'administrateur n'a pas pu se connecter. Reessayer dans quelques instants.`;
        res.status(500).json({ message, data: error });
      });
  });
};
