var express = require('express');
var flock = require('flockos');
var http = require('http');
var config = require('./config');
var bodyParser = require("body-parser");
var mongodb = require('mongodb');
var request = require('request');
var app = express();
var qs = require('querystring');
'use strict';
var waterfall = require('async-waterfall');
var MongoClient = mongodb.MongoClient;
var stocks = require('./stocks');
var news = require('./news');
var weather = require('./weather');
var cricscores = require('./cricscores');
var forex = require('./forex');
var dictionary = require('./dictionary');
var chatbot = require('./chatbot');



exports.getChatMessage = function(event, query) {

    var uri = "http://www.personalityforge.com/api/chat/?apiKey=rJKS5pYatAp09FdT&chatBotID=2&message=" + query + "&externalID=" + event.userId;
    var options = {};
    request.get(uri, options, function(err, res, body) {
        if (err || res.statusCode == 400 || res.statusCode == 404) {
            return {
                text: "Could'nt fetch Stock Details. Please Try Again Later."
            }
        }
        console.log("Fetching ChatBot Reply");
        var body = JSON.parse(body);
        console.log(body);
        var message = body.message.message;
        if (message.includes("Jimmy")) {
            message.replace('Jimmy', 'Gimme Bot');
        }
        if (message.includes("...")) {
            message.replace('...', '');

        }
        if (message.includes("fuck")) {
            message.replace("fuck", "hell");
        }

        if (message.includes("shit")) {
            message.replace("shit", "something");
        }
        console.log("Sending message");
        flock.callMethod('chat.sendMessage', config.botToken, {
                to: event.message.from,
                "text": message,
            },

            function(error, response) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("message sent");
                }
            });
    });
}
