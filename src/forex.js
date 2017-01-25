     
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
                var usd = Math.round(1/body.rates.USD*1000)/1000;
                var aud = Math.round(1/body.rates.AUD*1000)/1000;
                var sgd = Math.round(1/body.rates.SGD*1000)/1000;
                var brl = Math.round(1/body.rates.BRL*1000)/1000;
                var cad = Math.round(1/body.rates.CAD*1000)/1000;
                var chf = Math.round(1/body.rates.CHF*1000)/1000;
                var eur = Math.round(1/body.rates.EUR*1000)/1000;
                var czk = Math.round(1/body.rates.CZK*1000)/1000;
                var dkk = Math.round(1/body.rates.DKK*1000)/1000;
                var gbp = Math.round(1/body.rates.GBP*1000)/1000;
                var hkd = Math.round(1/body.rates.HKD*1000)/1000;
                var hrk = Math.round(1/body.rates.HRK*1000)/1000;
                var huf = Math.round(1/body.rates.HUF*1000)/1000;
                var jpy = Math.round(1/body.rates.JPY*1000)/1000;
                var nzd = Math.round(1/body.rates.NZD*1000)/1000;
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