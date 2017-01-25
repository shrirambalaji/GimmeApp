   'use strict';
   var express = require('express');
   var flock = require('flockos');
   var http = require('http');
   var config = require('./config');
   var bodyParser = require("body-parser");
   var request = require('request');
   var qs = require('querystring');


exports.getWeather = function(place,receiver){
var options;

	var locationsuri = 'http://dataservice.accuweather.com/locations/v1/cities/autocomplete' + '?' + qs.stringify({
                apikey: config.WeatherApiKey,
                q: place,
                language: "en-us"
            })
            options = {};
            var locationid;
            var LocalizedName;
            var State;
            var Country;
            var color;

            // GET LOCATION ID
            request.get(locationsuri, options, function(err, res, body) {
                if (err) {
                    return {
                        text: "Could'nt fetch the news. Try Again Later."
                    }
                }
                console.log("Fetching Location ID");
                if (body.length > 2) {
                    var body = JSON.parse(body);
                    locationid = body[0].Key;
                    LocalizedName = body[0].LocalizedName;
                    State = body[0].AdministrativeArea.LocalizedName;
                    Country = body[0].Country.LocalizedName;


                    var weatherurl = 'http://dataservice.accuweather.com/currentconditions/v1/' + locationid + '?' + qs.stringify({
                        apikey: config.WeatherApiKey,
                        language: "en-us",
                        details: "true"
                    })
                    options = {};

                    //GET CURRENT WEATHER DETAILS OF ACQUIRED LOCATION ID
                    request.get(weatherurl, options, function(err, res, weatherbody) {
                        if (err) {
                            return {
                                text: "Could'nt fetch Weather. Please Try Again Later."
                            }
                        }
                        console.log("Fetching Current Conditions");
                        var weatherbody = JSON.parse(weatherbody);
                         var current = weatherbody[0];

                        var iconid = current.WeatherIcon;
                        var iconurl;
                        if(iconid <= 6 || iconid == 20 || iconid == 21 || iconid == 23 || (iconid >=13 && iconid <= 17)){
                            color = "#f1c40f";
                        } else if ((iconid >6 && iconid <= 12) || iconid == 19 || iconid == 18 || iconid == 22 || iconid == 26){
                            color = "#7f8c8d";
                        } else if(iconid == 33 || iconid == 34){
                            color = "#B6B6B4"
                        } else if(iconid >31 && iconid <= 44){
                            color ="#95a5a6";
                        }
                        if (iconid < 10)
                            iconurl = "http://developer.accuweather.com/sites/default/files/0" + iconid + "-s.png";
                        else
                            iconurl = "http://developer.accuweather.com/sites/default/files/" + iconid + "-s.png";
                        console.log("Sending message");
                        flock.callMethod('chat.sendMessage', config.botToken, {
                                to: receiver,
                                "text": "",
                                "attachments": [{
                                    "title": LocalizedName + ", " + Country,
                                    "color": color,
                                    "description": "Temperature: " + current.Temperature.Metric.Value + '\u00B0' + "C\n" +
                                        "Feels Like: " + current.RealFeelTemperature.Metric.Value + '\u00B0' + "C\n" +
                                        "Relative Humidity: " + current.RelativeHumidity + "%\n" +
                                        "Wind: " + current.Wind.Speed.Metric.Value + " km/h " + current.Wind.Direction.English + "\n" +
                                        "Precipitation: " + current.PrecipitationSummary.Past24Hours.Metric.Value + " mm" + "\n" +
                                        "Current Condition: " + current.WeatherText,
                                    "views": {
                                        "image": {
                                            "original": {
                                                "src": iconurl,
                                                "width": 150,
                                                "height": 150
                                            }
                                        },
                                    }
                                }]
                            },
                            function(error, response) {
                                if (error) {
                                    console.log(error);
                                }else{
                                   console.log("Message sent");
                                }
                            });
                    });
                }
            });
}
