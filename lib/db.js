var mongoose = require('mongoose'),
    userModel = require('./models/User');

module.exports = function (uri) {

    var options = {
        server: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}},
        replset: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}}
    };

    mongoose.connect(uri, options);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error...'));
    db.once('open', function callback() {
        console.log('db opened');
    });

    userModel.createDefaultUsers();
};