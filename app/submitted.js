const dbconfig = require('../config/database');
const mysql = require('mysql');
var shortid = require('shortid');
var moment = require('moment');

module.exports = (app) => {

  app.get('/submitted', (req, res) => {
      res.redirect('search');
  });

  app.post('/submitted', ({ user }, res) => {

    const db = mysql.createConnection(dbconfig.connection);
    db.query(`USE ${dbconfig.database};`);

    // insert new Order
    var q = 'SELECT max(OrderID) as OrderID FROM Orders;';
    db.query(q, function(error, rows, fields) {
      if (error) {console.log(error);}
      else {
        var newOrderID = Number(rows[0].OrderID+1);
        var date= moment();
        var dateNow = date.format('YYYY-MM-DD');
        q = 'INSERT INTO Orders VALUES (?, ?, ?, ?);';
        db.query(q, [newOrderID, 'Completed', user.Username, dateNow], function(error, rows, fields) {
          if (error) {console.log(error);}
          else {
            for (var i = 0; i < app.locals.passengers; i++) {
              // insert new Passengers
              q = ['INSERT INTO `Passengers` SET PassengerID = ?, FirstName = ?, LastName = ?, DateOfBirth = ?, Gender = ?; ',
                    'INSERT INTO `Tickets` SET TicketNum = ?, AirlineCode = ?, FlightNum = ?, FlightDate = ?, Origin = ?, ',
                    'OrderID = ?, PassengerID = ?; INSERT INTO `Seats` SET SeatNum = ?, TicketNum = ?;'].join('');
              var passengerID = shortid.generate();
              var ticketNum = shortid.generate();
              var inserts = [passengerID, app.locals.passengerInfo.firstname[i], app.locals.passengerInfo.lastname[i],
                app.locals.passengerInfo.date[i], app.locals.passengerInfo.gender[i],
                ticketNum, app.locals.selectedFlight.AirlineCode, app.locals.selectedFlight.FlightNum, app.locals.selectedFlight.FlightDate, app.locals.selectedFlight.Origin, newOrderID, passengerID,
                app.locals.passengerInfo.SeatNum[i], ticketNum];
              db.query(q, inserts,
                function(error, rows, fields) {
                  if (error) {console.log(error);}
                  else {
                          res.render('submitted.ejs');
                  }
                });
              }
          }
        });
       }
     });
     db.close;
   });
}
