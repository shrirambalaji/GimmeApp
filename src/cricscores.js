var flock = require('flockos');
var config = require('./config');
var request = require('request');
var cricapi = require('node-cricapi');
var waterfall = require('async-waterfall');
exports.getScores = function(receiver) {

        var matchs;

        var scores;

        waterfall([

            function(callback) {

                cricapi.cricketMatches(function(databundle) {

                    console.log("Got bundle of ", databundle.length, " bytes for cricketMatches()");

                    var matches = JSON.parse(databundle).data;

                    matches.forEach(function(match) {

                        var teams = ["Afghanistan", "Australia", "Bangladesh", "England", "India", "Ireland", "New Zealand", "Pakistan", "Scotland", "South Africa", "Sri Lanka", "United Arab Emirates", "West Indies", "Zimbabwe"];

                        cricapi.cricketScores(match.unique_id, function(_matchData) {
                            var currentMatch = JSON.parse(_matchData, null, 2);
                            var matchStarted = currentMatch.matchStarted;
                            var teamA = currentMatch["team-1"];
                            var teamB = currentMatch["team-2"];
                            var required = currentMatch["innings-requirement"];
                            if (teams.indexOf(teamA) > -1 || teams.indexOf(teamB) > -1) {
                                var matchBetween = teamA + " VS " + teamB;
                                if (matchStarted) {
                                    scores = match.title;
                                    scores.replace("&amp;", "&");
                                    flock.callMethod('chat.sendMessage', config.botToken, {
                                        to: receiver,
                                        "text": "",
                                        "attachments": [{
                                            "title": matchBetween,
                                            "description": scores + "\n" + "Live Status : "+required,
                                            "color": "#0061ff"

                                        }]

                                    }, function(error, response) {
                                        if (!error) {
                                            console.log(response);
                                        }



                                    });



                                }
                            }



                        });



                    });



                })

                callback(scores);

            }

        ], function(scores, callback) {

            console.log(scores);



        });



        return {

            text: "Loading Scores For Today's Cricket Matches."

        }

    }
    //     var uri = "http://cricscore-api.appspot.com/csa"
    //     var options = {};
    //     var teams = ["Afghanistan", "Australia", "Bangladesh", "England", "India", "Ireland", "New Zealand", "Pakistan", "Scotland", "South Africa", "Sri Lanka", "United Arab Emirates", "West Indies", "Zimbabwe"];

//     request.get(uri, options, function(err, res, body) {
//         if (err) {
//             return {
//                 text: "Could'nt fetch Cricket Scores. Please Try Again Later."
//             }
//         }

//         console.log("Fetching Stock Quotes");
//         var body = JSON.parse(body);
//         body.forEach(function(match) {
//             var t1 = match.t1;
//             var t2 = match.t2;

//             if (teams.indexOf(t1) > -1 || teams.indexOf(t2) > -1){
//                 var scoreUri = "http://cricscore-api.appspot.com/csa?id=" + match.id;
//                 request.get(scoreUri, options, function(err, res, body) {
//                     if (err || res.sattusCode == 404) {
//                         return {
//                             text: "Could'nt fetch the meaning. Try Again Later."
//                         }
//                     }
//                     console.log("Fetching Scores");
//                     var body = JSON.parse(body);
//                     console.log(body);
//                     var total = body[0].de;
//                     var live = body[0].si;
//                     console.log("Sending message");
//                     flock.callMethod('chat.sendMessage', config.botToken, {
//                             to: receiver,
//                             "text": "",
//                             "attachments": [{
//                                 "title": live,
//                                 "color": "#0061ff",
//                                 "description": total
//                             }]
//                         },
//                         function(error, response) {
//                             if (error) {
//                                 console.log(error);
//                             } else {
//                                 console.log("message sent");
//                             }
//                         });

//                 });
//             }
//         });

//     });

//     return {
//         text: "Loading Scores For Today's Cricket Matches."
//     }


// }
