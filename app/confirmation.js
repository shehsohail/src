// app/confirmation.js
const dbconfig = require('../config/database');
const mysql = require('mysql');

module.exports = (app) => {
  app.get('/confirmation', (req, res) => {
      res.redirect('search');
  });

  app.post('/confirmation', isLoggedIn, (req, res) => {
    if (app.locals.passengers == 1) {
      app.locals.passengerInfo = {
        firstname: [req.body.firstname],
        lastname: [req.body.lastname],
        gender: [req.body.gender],
        date: [req.body.date],
        SeatNum: [req.body.SeatNum]}
    } else {
      if (duplicatesInArray(req.body.SeatNum)) {
        res.redirect('/search/?param1=true');
      } else {
        app.locals.passengerInfo = req.body;
      }
    }
    if (app.locals.selectedFlight === 'undefined') {
      res.redirect('search.ejs');
    }
    res.render('confirmation.ejs', {flight: app.locals.selectedFlight,
      passengers: app.locals.passengers,
      passengersInfo: app.locals.passengerInfo
      });
  });
}
function duplicatesInArray(a) {
  return a.length !== new Set(a).size;
}

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
