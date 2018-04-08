// server.js

// set up ======================================================================
// get all the tools we need
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 3000;

const passport = require('passport');
const flash = require('connect-flash');

// configuration ===============================================================
// connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovecs336',
    resave: true,
    saveUninitialized: true,
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static('public'));

require('./app/airportData.js')(app);
// routes ======================================================================
require('./app/passportRoutes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./app/index.js')(app);
require('./app/search.js')(app);
require('./app/passengers.js')(app);
require('./app/submitted.js')(app);
require('./app/account.js')(app);
require('./app/confirmation.js')(app);



// launch ======================================================================
app.listen(port);
console.log(`Server on port ${port}`);
