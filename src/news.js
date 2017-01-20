   //Sub categories within news
   var express = require('express');
   var flock = require('flockos');
   var http = require('http');
   var config = require('./config');
   var bodyParser = require("body-parser");
   var request = require('request');
   var qs = require('querystring');

   exports.getNews = function(category, receiver) {
       var color;
       switch (category) {
           case "general":
               uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                   source: "cnn",
                   sortBy: "top",
                   apiKey: config.newsApiKey
               });
               color = "#4c95d6";
               break;

           case "sports":
               uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                   source: "espn",
                   sortBy: "top",
                   apiKey: config.newsApiKey
               });
               color = "#0fd848";
               break;
           case "tech":
               uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                   source: "techcrunch",
                   sortBy: "top",
                   apiKey: config.newsApiKey
               });
               color = "#7200ff";
               break;
           case "business":
               uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                   source: "business-insider",
                   sortBy: "top",
                   apiKey: config.newsApiKey
               });
               color = "#888989";
               break;
           case "entertainment":
               uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                   source: "entertainment-weekly",
                   sortBy: "top",
                   apiKey: config.newsApiKey
               });
               color = "#ff6100";
               break;
           case "games":
               uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                   source: "polygon",
                   sortBy: "top",
                   apiKey: config.newsApiKey
               });
               color = "#00e8d0";
               break;
           case "science":
               uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                   source: "new-scientist",
                   sortBy: "top",
                   apiKey: config.newsApiKey
               });
               color = "#00e8d0";
               break;
           case "music":
               uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                   source: "mtv-news",
                   sortBy: "top",
                   apiKey: config.newsApiKey
               })
               color = "#ff93f7";
               break;
           case "cricket":
               uri = 'https://newsapi.org/v1/articles' + '?' + qs.stringify({
                   source: "espn-cric-info",
                   sortBy: "top",
                   apiKey: config.newsApiKey
               });
               color = "#0094ff";
               break;
       }
       console.log(uri);
       var options = {};
       request.get(uri, options, function(err, res, body) {
           if (err) {
               return {
                   text: "Could'nt fetch the news. Try Again Later."
               }
           }
           var body = JSON.parse(body);
           var articles = body.articles;
           for (var i = 0; i < articles.length; i++) {
               //TODO: handle err
               flock.callMethod('chat.sendMessage', config.botToken, {
                       to: receiver,
                       "text": "",
                       "attachments": [{
                           "title": articles[i].title,
                           "description": articles[i].description,
                           "url": articles[i].url,
                           "views": {
                               "image": {
                                   "original": {
                                       "src": articles[i].urlToImage,
                                       "width": 250,
                                       "height": 250
                                   }
                               },

                           },
                            "buttons": [{        
                               "name": "Read More",
                                       "icon": "http://image.flaticon.com/icons/png/128/63/63568.png",
                                       "action": {
                                   "type": "openBrowser",
                                   "url": articles[i].url,
                                   "sendContext": false
                               },
                               "id": "readMoreBtn"
                           }],
                           "color": color

                       }]
                   },
                   function(error, response) {
                       if (!error) {
                           console.log(response);
                       }
                   });
           }
       });



       return {
           text: "Loading News Articles For Today's Feed!"
       }

   }
