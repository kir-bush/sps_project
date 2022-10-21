 const Sequelize = require("sequelize");

 const dbInfoConn  = new Sequelize("sitesps", "root", "AD3EA77E", {
  dialect: "mysql",
  host: "localhost",
  port: "3306",
  logging: false
});

 const dbBiConn  = new Sequelize("bi", "root", "AD3EA77E", {
  dialect: "mysql",
  host: "localhost",
  port: "3306"
});

const dbserv = {};
dbserv.Sequelize = Sequelize;
dbserv.dbInfoConn = dbInfoConn;
dbserv.dbBiConn = dbBiConn;
dbserv.docs = require('./docsModel')(dbInfoConn, Sequelize);
dbserv.users = require('./usersModel')(dbInfoConn, Sequelize);
dbserv.cats = require('./catsModel')(dbInfoConn, Sequelize);
dbserv.democharts = require('./democharts')(dbBiConn, Sequelize);
module.exports = dbserv;