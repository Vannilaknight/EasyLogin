var mongoose = require('mongoose'),
    passport = require('passport');

module.exports = function (app, uri) {

    require('./db')(uri);

    app.use(passport.initialize());
    app.use(passport.session());

    return require('./auth');
};