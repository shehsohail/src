// app/passportRoutes.js

module.exports = (app, passport) => {

    // Login
    app.get('/login', (req, res) => {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure account section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true, // allow flash messages
    }), ({ body, session }, res) => {
        console.log('hello');

        if (body.remember) {
            session.cookie.maxAge = 1000 * 60 * 3;
        } else {
            session.cookie.expires = false;
        }
        res.redirect('/');
    });

    // Signup
    app.get('/signup', (req, res) => {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/account', // redirect to the secure account section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true, // allow flash messages
    }));

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
