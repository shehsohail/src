// config/passport.js

// load all the things we need
const LocalStrategy = require('passport-local').Strategy;

// load up the user model
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');
const dbconfig = require('../config/database');
var shortid = require('shortid');
const connection = mysql.createConnection(dbconfig.connection);

connection.query(`USE ${dbconfig.database}`);
// expose this function to our app using module.exports
module.exports = (passport) => {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
      done(null, user.Username);
    });

    // used to deserialize the user
    passport.deserializeUser((id, done) => {
        connection.query('SELECT * FROM Customers WHERE Username = ? ', [id], (err, rows) => {
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true, // allows us to pass back the entire request to the callback
        }, (req, email, password, done) => {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query('SELECT * FROM Customers WHERE Email_Address = ?', [email], (err, { length }) => {
                if (err) return done(err);
                if (length) {
                    return done(null, false, req.flash('signupMessage', 'That email address is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    const newUserMysql = {
                        Username: shortid.generate(),
                        First_Name: req.body.firstname,
                        Last_Name: req.body.lastname,
                        Email_Address: email,
                        Password: bcrypt.hashSync(password, null, null)
                    };

                    const insertQuery = 'INSERT INTO Customers (Username, First_Name, Last_Name, Email_Address, Password) values (?,?,?,?,?)';

                    connection.query(insertQuery,
                      [newUserMysql.Username,
                        newUserMysql.First_Name,
                        newUserMysql.Last_Name,
                        newUserMysql.Email_Address,
                        newUserMysql.Password],
                      (err) => {
                        if (err) throw err;
                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true, // allows us to pass back the entire request to the callback
        }, (req, email, password, done) => { // callback with email and password from our form
            connection.query('SELECT * FROM Customers WHERE Email_Address = ?', [email], (err, rows) => {
                if (err) return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'User not found.')); // req.flash is the way to set flashdata using connect-flash
                }
                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].Password)) {
                  return done(null, false, req.flash('loginMessage', 'Wrong password.')); // create the loginMessage and save it to session as flashdata
                }
                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );
};
