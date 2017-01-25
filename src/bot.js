'use strict';
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
var chatbot = require('./chatbot');

exports.getReply = function(event) {
        var text = event.message.text.split(" ");
        //sub categories
        var query = text[0];

        if (query === "gimme") {
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
                    if (place == undefined) {
                        flock.callMethod('chat.sendMessage', config.botToken, {
                                to: event.userId,
                                "text": "",
                                "attachments": [{
                                    "title": "Please specify the location to get weather",
                                    "description": "To know more read the docs at https:\/\/gimme-app.github.io/showcase.html"
                                }]
                            },

                            function(error, response) {
                                if (error) {
                                    console.log(error);
                                }
                            });
                    } else {
                        console.log(event.userName + " selected city " + place);
                        weather.getWeather(place, event.message.from);
                    }
                    break;

                    // Start of stock
                case "stocks":
                    var bot = true;
                    var org = text[2];
                    var findSymbolsUrl = "https://www.nseindia.com/content/corporate/eq_research_reports_listed.htm";

                    if (org == undefined) {

                        flock.callMethod('chat.sendMessage', config.botToken, {
                                to: event.userId,
                                "text": "",
                                "attachments": [{
                                    "title": "Please specify the organisation's name to get stock details",
                                    "description": "The list of symbols are available at" + "\n" + findSymbolsUrl + "\n" + "To know more read the docs at https:\/\/gimme-app.github.io/showcase.html"
                                }]
                            },

                            function(error, response) {
                                if (error) {
                                    console.log(error);
                                }
                            });
                    } else
                        stocks.getStocks(org, event, bot, event.message.from);
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

                case "help":
                    flock.callMethod('chat.sendMessage', config.botToken, {
                            to: event.message.from,
                            "text": "",
                            "attachments": [{
                                "title": "Help",
                                "description": "\/gimme [news] category\n\/gimme [weather] city\n\/gimme [stocks] stock\n\/gimme [cricscores]\n\/gimme [forex]\n\/gimme [meaning] word\nto know more visit: https:\/\/gimme-app.github.io/showcase.html"
                            }]
                        },

                        function(error, response) {
                            if (error) {
                                console.log(error);
                            }
                        });
                    break;


            }

        } else if(query!=undefined && !query.contains(config.appId)){
          console.log(query);
            if (query.includes("fuck") || query.includes("shit")) {
                flock.callMethod('chat.sendMessage', config.botToken, {
                        to: event.message.from,
                        "text": "Please mind your language mate."
                    },

                    function(error, response) {
                        if (error) {
                            console.log(error);
                        }
                    });
            } else {
                chatbot.getChatMessage(event, query);
            }

        }
    }
