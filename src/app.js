var express = require('express');
var flock = require('flockos');
var myParser = require("body-parser");
var app = express();
app.use(myParser.urlencoded({extended : false}));
app.use(myParser.json());

//post request handles the /events request from flock
app.post('/events',function(req,res){
  console.log(req.body);
  res.sendStatus(200);
});

//this starts the listening on the particular port
app.listen(80, function () {
  console.log('DailyFeed listening on port 80!');
});
