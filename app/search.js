// app/search.js

const dbconfig = require('../config/database');
const mysql = require('mysql');

module.exports = (app, passport) => {
    // Search
    app.get('/search', isLoggedIn, (req, res) => {
        // render the page and pass in any flash data if it exists
        var duplicateSeats = false;
        if (typeof req.query.param1 != 'undefined') {
          duplicateSeats = true;
        }
        res.render('search.ejs', {airportData: app.locals.airportData, duplicatesFound: duplicateSeats});
    });

    app.post('/search', isLoggedIn, (req, res) => {
      var flightRequest = {
        Origin: req.body.Origin,
        Destination: req.body.Destination,
        DepartDate: req.body.date
      };

      app.locals.passengers = req.body.Passengers;

      const db = mysql.createConnection(dbconfig.connection);
      db.query(`USE ${dbconfig.database};`);
      var q = ['SELECT * FROM Flights f ',
                'LEFT JOIN Pricing as p ON p.AirlineCode = f.AirlineCode AND p.AirportCode = f.Origin ',
                'LEFT JOIN Airlines as a ON a.AirlineCode = f.AirlineCode ',
                'WHERE f.Origin = ? AND f.Destination = ? AND f.FlightDate = ? ',
                'ORDER BY f.DepartTime'].join('');
      db.query(q, [flightRequest.Origin, flightRequest.Destination, flightRequest.DepartDate],
        function(error, rows, fields) {
          if (error) return console.log(error);
          if (!rows.length) {
            res.render('search.ejs', {message: 'No flights found.' });
          } else {
            app.locals.flightResult = rows;
            res.render('search.ejs', { flights: rows });
        }
      });
      db.close;
    })
};

// route middleware to make sure user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
