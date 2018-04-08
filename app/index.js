const dbconfig = require('../config/database');
const mysql = require('mysql');
var moment = require('moment');

module.exports = (app) => {
  // Homepage
  app.get('/', (req, res) => {
    var date= moment();
    var dateNow = date.format('YYYY-MM-DD');
    var timeNow = date.format('HHmm');
    const db = mysql.createConnection(dbconfig.connection);
    db.query(`USE ${dbconfig.database};`);
    var q = ['SELECT a.AirlineName, f.AirlineCode, FlightNum, o.City, o.State, f.Origin, f.DepartTime, ',
              'd.City as destCity, d.State as destState, f.Destination, f.ArrivalTime, p.Price FROM Flights as f ',
              'LEFT JOIN Airports as o ON f.Origin = o.Airport_Code ',
              'LEFT JOIN Airports as d ON f.Destination = d.Airport_Code ',
              'LEFT JOIN Pricing as p ON p.AirlineCode = f.AirlineCode AND p.AirportCode = f.Origin ',
              'LEFT JOIN Airlines a ON f.AirlineCode = a.AirlineCode ',
              'WHERE FlightDate = ? AND f.DepartTime >= ? ',
              'ORDER BY f.DepartTime LIMIT 10;'].join('');
    db.query(q, [dateNow, timeNow],
      function(error, rows, fields) {
        if (error) return console.log(error);
        if (!rows.length) {
          console.log("No flights returned.")
        } else {
          var userLoggedIn = false;
          if (req.isAuthenticated()) {
            userLoggedIn = true;
          }
          res.render('index.ejs', { upcomingFlights: rows, userLoggedIn });
      }
    });
    db.close;
  })
}
