var express = require('express');
var flock = require('flockos');
var config = require('./config');
var myParser = require("body-parser");
var app = express();

flock.setAppId(config.appId);
flock.setAppSecret(config.appSecret);

// app.use(myParser.urlencoded({extended : false}));
// app.use(myParser.json());

app.use(flock.events.tokenVerifier);

app.post('/events', flock.events.listener);

flock.events.on('app.install', function (event) {
});


//this starts the listening on the particular port
app.listen(config.port, function () {
  console.log('DailyFeed listening on port 80!');
});
