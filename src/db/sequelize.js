// @ts-nocheck
require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

const UserModel = require("./models/User");
const DataTest = require("./data_test");

const AdminModel = require("./models/Admin");

const EventModel = require("./models/Event");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    dialectOptions: {},
    logging: false,
  }
);

const User = UserModel(sequelize, DataTypes);
const Admin = AdminModel(sequelize, DataTypes);

const Event = EventModel(sequelize, DataTypes);

const initDb = () => {
  return sequelize.sync().then(() => {
    // Event.bulkCreate(DataTest);

    console.log(`La base de données a bien été initialisée !`);
  });
};

module.exports = {
  initDb,
  Event,
  User,
  Admin,
};
