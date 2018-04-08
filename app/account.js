// Account
const dbconfig = require('../config/database');
const mysql = require('mysql');

module.exports = (app) => {
  app.get('/account', isLoggedIn, ({ user }, res) => {

    const db = mysql.createConnection(dbconfig.connection);
    db.query(`USE ${dbconfig.database};`);
    var q = ['SELECT o.OrderID, o.OrderStatus, o.OrderDate, t.TicketNum, p.PassengerID, p.FirstName, p.LastName, ',
              'p.Gender, a.AirlineName, f.AirlineCode, f.FlightNum, f.FlightDate, f.Origin, f.DepartTime, f.Destination, ',
              'f.ArrivalTime, s.SeatNum, Pricing.Price FROM Orders o ',
              'LEFT JOIN Tickets t ON o.OrderID = t.OrderID ',
              'LEFT JOIN Passengers p ON t.PassengerID = p.PassengerID ',
              'LEFT JOIN Seats s ON s.TicketNum = t.TicketNum ',
              'LEFT JOIN Flights f ON t.AirlineCode = f.AirlineCode AND t.FlightNum = f.FlightNum ',
              'AND t.FlightDate = f.FlightDate AND t.Origin = f.Origin ',
              'LEFT JOIN Airlines a ON f.AirlineCode = a.AirlineCode ',
              'LEFT JOIN Pricing ON Pricing.AirlineCode = f.AirlineCode AND Pricing.AirportCode = f.Origin ',
              'WHERE Customer_Username = ? ORDER BY o.OrderID DESC'].join('');
    db.query(q, [user.Username],
      function(error, rows, fields) {
        if (error) return console.log(error);
        if (rows.length) {
          res.render('account.ejs', { user, orderHistory: rows});
        } else {
          res.render('account.ejs', {user});
        }
      });
    db.close;
  });

  app.post('/account', isLoggedIn, (req, res) => {
    if (typeof req.body.optradio != 'undefined') {
      const db = mysql.createConnection(dbconfig.connection);
      db.query(`USE ${dbconfig.database};`);
      var q = 'DELETE FROM Tickets WHERE TicketNum = ?';
      db.query(q, req.body.optradio,
        function(error, rows, fields) {
          if (error) return console.log(error);
          else {
            q = ['SELECT * FROM Orders LEFT JOIN Tickets ON Orders.OrderID = Tickets.OrderID ',
                'WHERE Orders.OrderID = ?'].join('');
            db.query(q, req.body.OrderID,
              function(error, rows, fields) {
                if (error) return console.log(error);
                if (rows.length) {
                  if(rows[0].TicketNum == null) {
                    db.query('UPDATE Orders SET OrderStatus = "Cancelled" WHERE OrderID = ?', req.body.OrderID,
                      function(error, rows) {
                        if (error) return console.log(error);
                        res.redirect('account');
                      });
                  } else {
                    res.redirect('account');
                  }
                }
              });
              db.close;
          }
        });
      db.close;
    } else {
      res.redirect('account');
    }
  });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
