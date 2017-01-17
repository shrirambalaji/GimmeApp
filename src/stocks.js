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

exports.getStocks = function(org, event) {
    var symbol = org;
    var stockName;
    collection = mongoConnection.collection('stock');
    collection.findOne({
        "SYMBOL": symbol.toUpperCase()
    }, function(err, document) {
        stockName = document.NAME;
    });
    var uri = "http://finance.google.com/finance/info?client=ig&q=NSE:" + symbol;
    var options = {};
    request.get(uri, options, function(err, res, body) {
        if (err) {
            return {
                text: "Could'nt fetch Stock Details. Please Try Again Later."
            }
        }
        body = body.replace('// ', '');
        var body = JSON.parse(body);
        console.log("STOCK:" + body);
        var stock = body[0].t;
        var price = body[0].l;
        var change = body[0].c;
        var changepercent = body[0].cp;
        flock.callMethod('chat.sendMessage', config.botToken, {
                to: event.chat,
                "text": "Powered By Google Finance",
                "attachments": [{
                    "title": stockName,
                    "description": "Symbol: " + stock + "\n" +
                        "price: " + price + "\n" +
                        "Change: " + change + " ( " + changepercent + " % )"

                }]
            },

            function(error, response) {
                if (!error) {
                    console.log(response);
                }
            });
    });
}
