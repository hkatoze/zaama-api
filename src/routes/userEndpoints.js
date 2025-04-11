const { User } = require("../db/sequelize");
const { ValidationError, Op } = require("sequelize");
const auth = require("../auth/auth");

module.exports = (app) => {
  // Ajouter un utilisateur
  app.post("/api/users", auth, (req, res) => {
    User.create(req.body)
      .then((user) => {
        const message = "Nouvel user ajouté.";
        res.json({ message, data: user });
      })
      .catch((error) => {
        if (error instanceof ValidationError) {
          return res.status(400).json({ message: error.message });
        }
        const message =
          "L'user n'a pas pu être créé. Réessayez dans quelques instants.";
        res.status(500).json({ message, data: error });
      });
  });

  // Récupérer tous les users
  app.get("/api/users", auth, (req, res) => {
    User.findAll()
      .then((users) => {
        const message = "La liste des users a été récupérée.";
        res.json({ message, data: users });
      })
      .catch((error) => {
        const message = "La liste des users n'a pas pu être récupérée.";
        res.status(500).json({ message, data: error });
      });
  });

  // Supprimer un User
  app.delete("/api/users/:id", auth, (req, res) => {
    User.findByPk(req.params.id)
      .then((user) => {
        if (!user) {
          const message = "user non trouvé.";
          return res.status(404).json({ message });
        }
        return User.destroy({ where: { id: req.params.id } }).then(() => {
          const message = `User avec l'ID ${req.params.id} supprimé.`;
          res.json({ message });
        });
      })
      .catch((error) => {
        const message = "Erreur lors de la suppression.";
        res.status(500).json({ message, data: error });
      });
  });
};
