var express = require('express');
var app = express();

//post request handles the /events request from flock
app.post('/events',function(req,res){

  console.log(req);
res.sendStatus(200);
});

//this starts the listening on the particular port
app.listen(80, function () {
  console.log('DailyFeed listening on port 80!');
});


