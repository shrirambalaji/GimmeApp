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

exports.getReply = function(event) {
    var text = event.message.text.split(" ");

    //sub categories
    var service = text[1];
    switch (service) {
        //NEWS
        case "news":
            var category = text[2];
            if (category == undefined)
                category = "general";
            news.getNews(category, event.message.from);
            //End of news
            break;

            //Start of weather
        case "weather":
            var uri;
            var current;
            var place = text[2];
            weather.getWeather(place, event.message.from);
            break;

            // Start of stock
        case "stocks":
            var org = text[2];
            stocks.getStocks(org, event.message.from);
            break;
            //End of stock

            //Start of Cricket Scores
        case "cricscores":
            cricscores.getScores(event.message.from);
            break;
            //End of Cricket Scores

            //Start of Forex Rates
        case "forex":
            forex.getRates(event.message.from);
            break;

            //meaning
        case "meaning":
            var word = text[2];
            dictionary.getMeaning(word, event.message.from);
            break;

    }

}
