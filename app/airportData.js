// app/airportData.js

const dbconfig = require('../config/database');
const mysql = require('mysql');

module.exports = (app) => {
  const db = mysql.createConnection(dbconfig.connection);
  db.query(`USE ${dbconfig.database};`);
  var q = 'SELECT * FROM Airports'
  db.query(q, function(error, rows, fields) {
      if (error) return console.log(error);
      if (rows.length) {
        app.locals.airportData = rows;
      }
  });
  db.close;
};
