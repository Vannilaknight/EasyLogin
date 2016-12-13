var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    encrypt = require('./utilities/encryption');

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({username: username}).exec(function (err, user) {
            if (user && user.authenticate(password)) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
    }
));

passport.serializeUser(function (user, done) {
    if (user) {
        done(null, user._id);
    }
});

passport.deserializeUser(function (id, done) {
    User.findOne({_id: id}).exec(function (err, user) {
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    })
});

exports.authenticate = function (req, res, next) {
    req.body.username = req.body.username.toLowerCase();
    var auth = passport.authenticate('local', function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            res.send({success: false})
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            res.send({
                success: true,
                user: user
            });

        })
    });

    auth(req, res, next);
};

exports.requiresApiLogin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(403);
        res.end();
    } else {
        next();
    }
};

exports.requiresRole = function (role) {
    return function (req, res, next) {
        if (!req.isAuthenticated() || req.user.roles.indexOf(role) === -1) {
            res.status(403);
            res.end();
        } else {
            next();
        }
    }
};

exports.register = function (req, res, next) {
    var newUserData = req.body;
    if (!newUserData) {
        res.status(403);
        res.end();
    }

    User.findOne({username: newUserData.username}).exec(function (err, user) {
        if(err) return next(err);
        if (user) {
            res.json({status: 401, message: "Username Taken"});
            res.end();
        } else {
            var salt, hash;
            salt = encrypt.createSalt();
            hash = encrypt.hashPwd(salt, newUserData.password);
            User.create({
                email: newUserData.email,
                username: newUserData.username,
                salt: salt,
                hashed_pwd: hash,
                roles: newUserData.roles
            });
            res.status(200);
            res.end();
        }
    });
};