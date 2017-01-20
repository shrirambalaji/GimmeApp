   var express = require('express');
   var flock = require('flockos');
   var http = require('http');
   var config = require('./config');
   var bodyParser = require("body-parser");
   var request = require('request');
   var qs = require('querystring');

   exports.getMeaning = function(word, receiver) {
       var uri1 = " https://od-api.oxforddictionaries.com/api/v1/entries/en/" + word + "/definitions";
       options = {
           headers: {
               "Accept": "application/json",
               "app_id": "85a7c394",
               "app_key": "3097aa0e924a08c216d79e101cc650c4"
           }
       };
       var uri2 = " https://od-api.oxforddictionaries.com/api/v1/entries/en/" + word + "/examples";

       request.get(uri1, options, function(err, res, body) {
           if (err || res.statusCode == 404) {
               return {
                   text: "Could'nt fetch the meaning. Try Again Later."
               }
           }

           var body = JSON.parse(body);
           var results = body.results;


           var meaning = results[0].lexicalEntries[0].entries[0].senses[0].definitions;

           options = {
               headers: {
                   "Accept": "application/json",
                   "app_id": "85a7c394",
                   "app_key": "3097aa0e924a08c216d79e101cc650c4"
               }
           };
           request.get(uri2, options, function(err, res, body) {
               if (err || res.statusCode == 404) {
                   return {
                       text: "Could'nt fetch the meaning. Try Again Later."
                   }
               }

               var body = JSON.parse(body);
               var results = body.results;


               var example = results[0].lexicalEntries[0].entries[0].senses[0].examples[0].text;
               
               console.log(meaning);
               console.log(example);


                flock.callMethod('chat.sendMessage', config.botToken, {
                           to: receiver,
                           "text": "Powered by Oxford Dictionaries",
                           "attachments": [{
                               "title": word,
                               "color": "#0061ff",
                               "description": "Definition : " + meaning + "\n" +
                                   "Example : " + example + "\n"
                           }]
                       },
                       function(error, response) {
                           if (!error) {
                               console.log(response);
                           }
                       });





           });




       });


   }
