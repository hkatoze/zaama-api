const bodyParser = require("body-parser");
const express = require("express");
const { initDb } = require("./src/db/sequelize");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json()).use(cors());

app.use((req, res, next) => {
  console.log(`Requête reçue: ${req.method} ${req.url}`);
  next();
});
initDb();

/* ........All routes list........... */
require("./src/routes/adminEndpoints")(app);
require("./src/routes/userEndpoints")(app);
require("./src/routes/eventEndpoints")(app);
require("./src/routes/uploadFileOnFirebase")(app);

//404 error managment
app.use(({ res }) => {
  const message = `Impossible de trouver la ressource demandée! Vous pouvez essayer une autre URL.`;
  res?.status(404).json({ message });
});

app.listen(port, () => {
  console.log(`Notre api a démaré sur : http://localhost:${port}`);
});

module.exports = app;
