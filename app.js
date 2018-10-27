var config = require('./config.json');
var util = require('util');

var queue1 = [];
var queue2 = [];
var queueflag = true;

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    twitter = require('twitter');

app.listen(3000);

var twit = new twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
});

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
  
      res.writeHead(200);
      res.end(data);
    });
}


twit.stream('statuses/filter', { track: 'jobs' }, function(stream) {
  stream.on('data', function (data) {
    io.sockets.emit('tweet', data.text);
    //console.log(`Data from ${data.id} (${data.user.screen_name}) from ${data.user.location}`);
    //function to write on file
    pushToQueue(data);
  });
});

function pushToQueue(data) {
  
  if(queueflag){
    queue1.push(data);
    console.log(`Data in Queue1 : ${queue1.length}`);

    if(queue1.length === 5) {
      queueflag = false;
      console.log(`----------> Writing ${queue1.length} data of Queue1.`);
      writeOnFile(queue1);
    }

  } else {
    queue2.push(data);
    console.log(`Data in Queue2 : ${queue2.length}`);

    if(queue2.length === 5) {
      queueflag = true;
      console.log(`----------> Writing ${queue2.length} data of Queue2.`);
      writeOnFile(queue2);
    }

  }

  
  //var stream = fs.createWriteStream(`./data/${getCurrentTime()}.json`);
  //stream.write(util.inspect(data).trim(), 'UTF-8');
}

function writeOnFile(queue) {
  fs.writeFile(`./data/${getCurrentTime()}.json`,JSON.stringify(queue, null, 4),function(err) {
    if(err){
      console.log(err);
    }
    queue.length = 0;
    console.log("===== Data Written =====");
  });
}

function writeOnFileFromQ1(queue1) {
  fs.writeFile(`./data/${getCurrentTime()}.json`,util.inspect(queue1),function(err) {
    if(err){
      console.log(err);
    }
    queue1.length = 0;
    console.log("===== Data Written =====");
  });
}

function writeOnFileFromQ2(queue2) {
  fs.writeFile(`./data/${getCurrentTime()}.json`,util.inspect(queue2),function(err) {
    if(err){
      console.log(err);
    }
    queue2.length = 0;
    console.log("===== Data Written =====");
  });
}

function getCurrentTime() {
  var d = new Date();
  return `${d.getFullYear()}_${d.getMonth()}_${d.getDate()}_${d.getHours()}_${d.getMinutes()}_${d.getSeconds()}`;
}