   var express = require('express');
   var flock = require('flockos');
   var http = require('http');
   var config = require('./config');
   var bodyParser = require("body-parser");
   var request = require('request');
   var qs = require('querystring');

exports.getWeather = function(place,event){
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

            // GET LOCATION ID
            request.get(locationsuri, options, function(err, res, body) {
                if (err) {
                    return {
                        text: "Could'nt fetch the news. Try Again Later."
                    }
                }
                console.log("body " + body);
                if (body.length > 0) {
                    var body = JSON.parse(body);
                    locationid = body[0].Key;
                    LocalizedName = body[0].LocalizedName;
                    State = body[0].AdministrativeArea.LocalizedName;
                    Country = body[0].Country.LocalizedName;
                    console.log("LocalizedName" + LocalizedName);
                    console.log("locationid " + body[0].Key);

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
                        var weatherbody = JSON.parse(weatherbody);
                        current = weatherbody[0];
                        iconid = current.WeatherIcon;
                        if (iconid < 10)
                            iconurl = "http://developer.accuweather.com/sites/default/files/0" + iconid + "-s.png";
                        else
                            iconurl = "http://developer.accuweather.com/sites/default/files/" + iconid + "-s.png";
                        flock.callMethod('chat.sendMessage', config.botToken, {
                                to: event.chat,
                                "text": "",
                                "attachments": [{
                                    "title": LocalizedName + ", " + Country,
                                    "description": "Temperature: " + current.Temperature.Metric.Value + '\u00B0' + "C\n" +
                                        "Feels Like: " + current.RealFeelTemperature.Metric.Value + '\u00B0' + "C\n" +
                                        "Relative Humidity: " + current.RelativeHumidity + "\n" +
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
                                if (!error) {
                                    console.log(response);
                                }
                            });
                    });
                }
            });
}