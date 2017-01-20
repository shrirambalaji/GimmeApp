var cricapi = require('node-cricapi');
var waterfall = require('async-waterfall');
var flock = require('flockos');
var config = require('./config');
exports.getScores = function(receiver){
	
	 var matchs;
            var scores;
            waterfall([
                function(callback) {
                    cricapi.cricketMatches(function(databundle) {
                        console.log("Got bundle of ", databundle.length, " bytes for cricketMatches()");
                        var matches = JSON.parse(databundle).data;
                        matches.forEach(function(match) {
                            cricapi.cricketScores(match.unique_id, function(_matchData) {
                                var currentMatch = JSON.parse(_matchData, null, 2);
                                // console.log("Got scores for unique_id ", match.unique_id, ": bundle of", _matchData.length, " bytes");
                                var matchStarted = currentMatch.matchStarted;
                                var teams = currentMatch.team - 1 + "VS" + currentMatch.team - 2;
                                if (matchStarted) {
                                    scores = match.title;
                                    scores.replace("&amp;", "&");
                                    flock.callMethod('chat.sendMessage', config.botToken, {
                                        to: receiver,
                                        "text": "",
                                        "attachments": [{
                                            "title": "",
                                            "description": scores,
                                            "color": "#c42f2f"
                                        }]
                                    }, function(error, response) {
                                        if (!error) {
                                            console.log(response);
                                        }

                                    });

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