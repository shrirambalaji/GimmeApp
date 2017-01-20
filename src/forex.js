     
   var express = require('express');
   var flock = require('flockos');
   var http = require('http');
   var config = require('./config');
   var bodyParser = require("body-parser");
   var request = require('request');
   var qs = require('querystring');

      exports.getRates = function(receiver){
      var uri = "http://api.fixer.io/latest?base=INR"
            var options = {};
            request.get(uri, options, function(err, res, body) {
                if (err) {
                    return {
                        text: "Could'nt fetch Today's Foreign Exchange Rates. Please Try Again Later."
                    }
                }
                console.log("Fetching forex information");
                var body = JSON.parse(body);
                var command = "/gimme forex";
                var usd = body.rates.USD;
                var aud = body.rates.AUD;
                var sgd = body.rates.SGD;
                var brl = body.rates.BRL;
                var cad = body.rates.CAD;
                var chf = body.rates.CHF;
                var eur = body.rates.EUR;
                var czk = body.rates.CZK;
                var dkk = body.rates.DKK;
                var gbp = body.rates.GBP;
                var hkd = body.rates.HKD;
                var hrk = body.rates.HRK;
                var huf = body.rates.HUF;
                var jpy = body.rates.JPY;
                var nzd = body.rates.NZD;
                console.log("Sending message");
                flock.callMethod('chat.sendMessage', config.botToken, {
                        to: receiver,
                        "text": "",
                        "attachments": [{
                            "title": "Forex INR",
                            "color" : "#99cc66",
                            "description": "US Dollar: " + usd + "\n" +
                                "Australian Dollar: " + aud + "\n" +
                                "Singapore Dollar: " + sgd + "\n" +
                                "Brazilian Real: " + brl + "\n" +
                                "Canadian Dollar: " + cad + "\n" +
                                "Swiss Franc: " + chf + "\n" +
                                "Euro: " + eur + "\n" +
                                "Czech Republic Koruna: " + czk + "\n" +
                                "Danish Krone: " + dkk + "\n" +
                                "British Pound: " + gbp + "\n" +
                                "Hong Kong Dollar: " + hkd + "\n" +
                                "Croatian Kuna: " + hrk + "\n" +
                                "Hungarian Forint: " + huf + "\n" +
                                "Japanese Yen: " + jpy + "\n" +
                                "New Zealand Dollar: " + nzd + "\n"
                        }]
                    },
                    function(error, response) {
                        if (error) {
                            console.log(error);
                        }else{
                            console.log("message sent");
                        }
                    });

            });
        }