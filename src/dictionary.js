    var express = require('express');
    var flock = require('flockos');
    var http = require('http');
    var config = require('./config');
    var bodyParser = require("body-parser");
    var request = require('request');
    var qs = require('querystring');

    exports.getMeaning = function(word,event) {
        var uri = "http://api.pearson.com/v2/dictionaries/wordwise/entries?limit=1&headword=" + word;
        options = {};
        request.get(uri, options, function(err, res, body) {
            if (err) {
                return {
                    text: "Could'nt fetch the meaning. Try Again Later."
                }
            }
            var body = JSON.parse(body);
            var results = body.results;
            for (var i = 0; i < results.length; i++) {
                var example;
                var dictionary = results[i].senses[0];
                var ex = dictionary.examples;
                if (ex == undefined)
                    example = "";
                else
                    example = "Example : " + ex[0].text;
                console.log(ex);
                console.log(dictionary);
                flock.callMethod('chat.sendMessage', config.botToken, {
                        to: event.chat,
                        "text": "",
                        "attachments": [{
                            "title": word,
                            "description": "Definition : " + dictionary.definition + "\n" + example


                        }]
                    },
                    function(error, response) {
                        if (!error) {
                            console.log(response);
                        }
                    });
            }



        });
    }
    
