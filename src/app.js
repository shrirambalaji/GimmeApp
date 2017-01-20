var express = require('express');
var flock = require('flockos');
var http = require('http');
var config = require('./config');
var bodyParser = require("body-parser");
var mongodb = require('mongodb');
var request = require('request');
var app = express();
var qs = require('querystring');
var waterfall = require('async-waterfall');
var MongoClient = mongodb.MongoClient;
var stocks = require('./stocks');
var news = require('./news');
var weather = require('./weather');
var cricscores = require('./cricscores');
var forex = require('./forex');
var dictionary = require('./dictionary');
var bot = require('./bot');
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
var collection;
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
    collection = mongoConnection.collection('users');
    collection.insert({
        "userId": event.userId,
        "token": event.token
    }, function(err, doc) {
        if (err) throw err;
    });

});

//remove user id from db on uninstall
flock.events.on('app.uninstall', function(event) {

    collection = mongoConnection.collection('users');
    collection.remove({
        "userId": event.userId
    }, function(err, doc) {
        if (err) throw err;
        console.log(event);
    });

});

//manipulating slash commands
flock.events.on('client.slashCommand', function(event) {

    collection = mongoConnection.collection('users');

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


var first = event.chat[0];
if(first === "g")
	 receiver = event.chat;
	else
		receiver = event.userId;
    //sub categories
    var service = text[0];
    switch (service) {
        //NEWS
        case "news":
            var category = text[1];
            if (category == undefined)
                category = "general";
            news.getNews(category,receiver);

            //End of news
            break;

            //Start of weather
        case "weather":
            var uri;
            var current;
            var place = text[1];
            weather.getWeather(place,receiver);
            break;

            // Start of stock
        case "stocks":
            var org = text[1];
            stocks.getStocks(org,receiver);
            break;
            //End of stock

            //Start of Cricket Scores
        case "cricscores":
            cricscores.getScores(receiver);
            break;
            //End of Cricket Scores

            //Start of Forex Rates
        case "forex":
            forex.getRates(receiver);
            break;

        case "meaning":
            var word = text[1];
            dictionary.getMeaning(word,receiver);
            break;


        default:
            flock.callMethod('chat.sendMessage', config.botToken, {
                to: event.userId,
                "text": "",
                "attachments": [{
                    "title": "Usage",
                    "description": "\/gimme [news] category\n\/gimme [weather] city\n\/gimme [stocks] stock\n\/gimme [cricscores]\n\/gimme [forex]\n\/gimme [meaning] word\nFor more info: https:\/\/gimme-app.github.io/showcase.html"
                }]
            },

            function(error, response) {
                if (!error) {
                    console.log(response);
                }
            });

       		     


    }

});

flock.events.on('chat.receiveMessage',function(event){
bot.getReply(event);
});




//this starts the listening on the particular port
app.listen(process.env.PORT, function() {
    console.log('GimmeApp listening on ' + process.env.PORT);
});


process.on('SIGINT', process.exit);
