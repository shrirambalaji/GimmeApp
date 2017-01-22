'use strict';
var express = require('express');
var flock = require('flockos');
var http = require('http');
var config = require('./config');
var bodyParser = require("body-parser");
var mongodb = require('mongodb');
var request = require('request');
var qs = require('querystring');
var waterfall = require('async-waterfall');
var MongoClient = mongodb.MongoClient;
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

exports.getStocks = function(org, event, bot, receiver) {
    var symbol = org;
    var stockName;
    collection = mongoConnection.collection('stocks');
    collection.findOne({
        "SYMBOL": symbol.toUpperCase()
    }, function(err, document) {
        if (document != null)
            stockName = document.NAME;
        var findSymbolsUrl = "https://www.nseindia.com/content/corporate/eq_research_reports_listed.htm";
        if (err || document == null) {
            flock.callMethod('chat.sendMessage', config.botToken, {
                    to: event.userId,
                    "text": "",
                    "attachments": [{
                        "title": "Please specify an appropriate organisation symbol to know the stock values.",
                        "color": "#ff0000",
                        "description": "For the list of symbols available refer" + "\n" + findSymbolsUrl
                    }]
                },

                function(error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("message sent");
                    }
                });

        }
    });
    var uri = "http://finance.google.com/finance/info?client=ig&q=NSE:" + symbol;
    var options = {};
    request.get(uri, options, function(err, res, body) {
        if (err || res.statusCode == 400 || res.statusCode == 404) {
            return {
                text: "Could'nt fetch Stock Details. Please Try Again Later."
            }
        }
        console.log("Fetching Stock Quotes");
        body = body.replace('// ', '');
        var body = JSON.parse(body);
        var stock = body[0].t;
        var price = body[0].l;
        var change = body[0].c;
        var changepercent = body[0].cp;
        console.log("Sending message");
        flock.callMethod('chat.sendMessage', config.botToken, {
                to: receiver,
                "text": "",
                "attachments": [{
                    "title": stockName,
                    "color": "#FFD700",
                    "description": "Symbol: " + stock + "\n" +
                        "price: " + price + "\n" +
                        "Change: " + change + " ( " + changepercent + " % )"

                }]
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
