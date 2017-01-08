var express = require('express');
var flock = require('flockos');
var config = require('./config');
var myParser = require("body-parser");
var Mustache = require('mustache');
var mongodb = require('mongodb');
var store = require('./store');

var app = express();

var MongoClient = mongodb.MongoClient;

//Setting app id and details from config.js
flock.setAppId(config.appId);
flock.setAppSecret(config.appSecret);

//Verify user tokens
app.use(flock.events.tokenVerifier);

//setting relative path for Event listener
app.post('/events', flock.events.listener);

//manipulating app.install event
flock.events.on('app.install', function(event) {
    MongoClient.connect(config.dburl, function(err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            console.log('Connection established to', config.dburl);
            var collection = db.collection('users');
            collection.insert({
                "userId": event.userId,
                "token": event.token
            }, function(err, doc) {
                if (err) throw err;
                console.log(event);
            });
        }
    });
});

//remove user id from db on unistall
flock.events.on('app.uninstall', function(event) {
    MongoClient.connect(config.dburl, function(err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            console.log('Connection established to', config.dburl);
            var collection = db.collection('users');
            collection.remove({
                "userId": event.userId
            }, function(err, doc) {
                if (err) throw err;
                console.log(event);
            });
        }
    });
});


//this starts the listening on the particular port
app.listen(config.port, function() {
    console.log('DailyFeed listening on port 80!');
});
