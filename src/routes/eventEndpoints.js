const { Event } = require("../db/sequelize");
const dayjs = require("dayjs");
require("dayjs/locale/fr");
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
dayjs.locale("fr");

const { ValidationError, Sequelize, Op } = require("sequelize");
const auth = require("../auth/auth");

module.exports = (app) => {
  //Publier un évènement
  app.post("/api/events", auth, (req, res) => {
    Event.create(req.body)
      .then((event) => {
        const message = "Nouvel évènement publié.";
        res.json({ message, data: event });
      })
      .catch((error) => {
        if (error instanceof ValidationError) {
          return res.status(400).json({ message: error.message });
        }
        const message =
          "L'évènement n'a pas pu être publier. Réessayez dans quelques instants.";
        res.status(500).json({ message, data: error });
      });
  });

  //Modifier un évènement
  app.put("/api/events/:id", auth, (req, res) => {
    const id = req.params.id;

    Event.update(req.body, { where: { id } })
      .then(([updated]) => {
        if (!updated) {
          return res.status(404).json({ message: "L'évènement n'existe pas." });
        }

        return Event.findByPk(id).then((event) => {
          const message = "L'évènement a été modifié avec succès.";
          res.json({ message, data: event });
        });
      })
      .catch((error) => {
        if (error instanceof ValidationError) {
          return res.status(400).json({ message: error.message });
        }
        const message =
          "L'évènement n'a pas pu être modifier. Réessayez dans quelques instants.";
        res.status(500).json({ message, data: error });
      });
  });

  //Supprimer un évènement
  app.delete("/api/events/:id", auth, (req, res) => {
    const id = req.params.id;

    Event.findByPk(id)
      .then((event) => {
        if (!event) {
          return res.status(404).json({ message: "L'évènement n'existe pas." });
        }

        return Event.destroy({ where: { id } }).then(() => {
          const message = "L'évènement a été supprimé avec succès.";
          res.json({ message });
        });
      })
      .catch((error) => {
        const message =
          "L'évènement n'a pas pu être supprimé. Réessayez dans quelques instants.";
        res.status(500).json({ message, data: error });
      });
  });

  // Reccupérer tous les évènements publiés
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  app.get("/api/events", auth, async (req, res) => {
    const { city, date, q, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (city) where.city = city;
    if (date) where.event_date = { [Op.gte]: new Date(date) };
    else where.event_date = { [Op.gte]: new Date() };

    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }

    try {
      const { count, rows } = await Event.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        order: [["event_date", "ASC"]],
      });

      // Ajout du champ formaté
      const formattedRows = rows.map((event) => {
        const dateObj = new Date(event.event_date);
        const dayName = days[dateObj.getDay()];
        const dateStr = dateObj.toLocaleDateString("fr-FR");
        const hourStr = `${String(dateObj.getHours()).padStart(
          2,
          "0"
        )}H${String(dateObj.getMinutes()).padStart(2, "0")}`;

        return {
          ...event.toJSON(),
          event_date_formatted: {
            day: dayName,
            date: dateStr,
            hour: hourStr,
          },
        };
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        message: "Événements récupérés avec succès.",
        data: formattedRows,
        pagination: {
          totalItems: count,
          currentPage: parseInt(page),
          totalPages,
          pageSize: parseInt(limit),
        },
      });
    } catch (error) {
      const message = "Impossible de récupérer les événements.";
      res.status(500).json({ message, data: error });
    }
  });
};
