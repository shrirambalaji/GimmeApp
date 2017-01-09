var express = require('express');
var flock = require('flockos');
var http = require('http');
var config = require('./config');
var bodyParser = require("body-parser");
var mongodb = require('mongodb');
var request = require('request');
var app = express();
var qs = require('querystring');
var MongoClient = mongodb.MongoClient;

//Setting app id and details from config.js
flock.setAppId(config.appId);
flock.setAppSecret(config.appSecret);

app.use(bodyParser.json());
//Verify user tokens
app.use(flock.events.tokenVerifier);

//setting relative path for Event listener
app.post('/events', flock.events.listener);

var mongoConnection;
var tokens;
//connecting to mongodb
MongoClient.connect(config.dburl, function(err, db) {
    mongoConnection = db;
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', config.dburl);
    }
});


//manipulating app.install event
flock.events.on('app.install', function(event) {
    var collection = mongoConnection.collection('users');
    collection.insert({
        "userId": event.userId,
        "token": event.token
    }, function(err, doc) {
        if (err) throw err;
    });

});

//remove user id from db on uninstall
flock.events.on('app.uninstall', function(event) {

    var collection = mongoConnection.collection('users');
    collection.remove({
        "userId": event.userId
    }, function(err, doc) {
        if (err) throw err;
        console.log(event);
    });

});

//manipulating slash commands
flock.events.on('client.slashCommand', function(event) {

    var collection = mongoConnection.collection('users');

    //splitting sub commands
    var text = event.text.split(" ");

    console.log("userid: " + event.text);
    collection.findOne({
        "userId": event.userId
    }, function(err, document) {
        tokens = document.token;

    });
    flock.groups.list(tokens, null, function(error, response) {
        if (error) {
            console.log('error: ', error);
        } else {
            console.log(response);
        }
    });

    //sub categories
    switch (text[0]) {
        //NEWS
        case "news":
            var category = text[1];
            var uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                source: "espn-cric-info",
                sortBy: "latest",
                apiKey: "13228478c1034a9db6cca38e772ea590"
            })
            options = {};
            request.get(uri, options, function(err, res, body) {
                if (err) {
                    return {
                        text: "Could'nt fetch the news. Try Again Later."
                    }
                }

                var body = JSON.parse(body);
                var articles = body.articles;



                for (var i = 0; i < articles.length; i++) {
                    //TODO: handle err
                    flock.callMethod('chat.sendMessage', config.botToken, {
                            to: event.chat,
                            "text": "",
                            "attachments": [{
                                "title": articles[i].title,
                                "description": articles[i].description,
                                "views": {
                                    "image": {
                                        "original": {
                                            "src": articles[i].urlToImage
                                        }
                                    }
                                },
                                "url": articles[i].url
                            }]
                        },
                        function(error, response) {
                            if (!error) {
                                console.log(response);
                            }
                        });
                }
            });
            return {
                text: "Loading Articles For Today's Feed!"
            }
            //End of news
            break;
    }
});

//this starts the listening on the particular port
app.listen(config.port, function() {
    console.log('DailyFeed listening on ' + config.port);
});

process.on('SIGINT', process.exit);
