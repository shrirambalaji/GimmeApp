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

    //sub categories
    switch (text[0]) {
        //NEWS
        case "news":
            var uri;
            var category = text[1];
            //Sub categories within news
            switch (category) {
                case "general":
                    uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                        source: "the-times-of-india",
                        sortBy: "latest",
                        apiKey: config.NewsApiKey
                    })

                    break;
                case "sports":
                    uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                        source: "bbc-sport",
                        sortBy: "top",
                        apiKey: config.NewsApiKey
                    })
                    break;
                case "tech":
                    uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                        source: "engadget",
                        sortBy: "top",
                        apiKey: config.NewsApiKey
                    })
                    break;
                case "business":
                    uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                        source: "cnbc",
                        sortBy: "top",
                        apiKey: config.NewsApiKey
                    })
                    break;
                case "entertainment":
                    uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                        source: "entertainment-weekly",
                        sortBy: "top",
                        apiKey: config.NewsApiKey
                    })
                    break;
                case "game":
                    uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                        source: "ign",
                        sortBy: "top",
                        apiKey: config.NewsApiKey
                    })
                    break;
                case "science":
                    uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                        source: "new-scientist",
                        sortBy: "top",
                        apiKey: config.NewsApiKey
                    })
                    break;
                case "music":
                    uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                        source: "mtv-news",
                        sortBy: "top",
                        apiKey: config.NewsApiKey
                    })
                    break;
            }
            console.log(uri);
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
        case "weather":
            var uri;
            var current;
            var locationsuri = 'http://dataservice.accuweather.com/locations/v1/cities/autocomplete' + '?' + qs.stringify({
                apikey: config.WeatherApiKey,
                q: text[1],
                language: "en-us"
            })
            options = {};
            var locationid;
            var LocalizedName;
            request.get(locationsuri, options, function(err, res, body) {
                if (err) {
                    return {
                        text: "Could'nt fetch the news. Try Again Later."
                    }
                }
                console.log("body " + body);
                if (body.length != 2) {
                    var body = JSON.parse(body);
                    locationid = body[0].Key;
                    LocalizedName = body[0].LocalizedName;
                    console.log("LocalizedName" + LocalizedName);


                    console.log("locationid " + body[0].Key);

                    var weatherurl = 'http://dataservice.accuweather.com/currentconditions/v1/' + locationid + '?' + qs.stringify({
                        apikey: config.WeatherApiKey,
                        language: "en-us",
                        details: "true"
                    })
                    options = {};
                    request.get(weatherurl, options, function(err, res, weatherbody) {
                        if (err) {
                            return {
                                text: "Could'nt fetch the news. Try Again Later."
                            }
                        }
                        var weatherbody = JSON.parse(weatherbody);
                        current = weatherbody[0];



                        flock.callMethod('chat.sendMessage', config.botToken, {
                                to: event.chat,
                                "text": "",
                                "attachments": [{
                                    "title": LocalizedName,
                                    "description": "Temperature: " + current.Temperature.Metric.Value + "\n" +
                                        "Feels Like: " + current.RealFeelTemperature.Metric.Value + "\n" +
                                        "Relative Humidity: " + current.RelativeHumidity + "\n" +
                                        "Preciptation: " + current.PrecipitationSummary.Past24Hours.Metric.Value + " mm" + "\n" +
                                        "Sky: " + current.WeatherText,
                                }]
                            },
                            function(error, response) {
                                if (!error) {
                                    console.log(response);
                                }
                            });
                    });
                }
            });
    }
});

//this starts the listening on the particular port
app.listen(config.port, function() {
    console.log('DailyFeed listening on ' + config.port);
});

process.on('SIGINT', process.exit);
