var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const axios = require('axios')

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded

var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
var start = new Date('2018-04-23');
var engineer = ["Fakhri @fakhri_mahathir", "Azki @azkidarmawan", "Iddad @idadidut", "Kelvin @Kelvinliu007"];

//This is the route the API will call
app.post('/new-message', function(req, res) {
  const {message} = req.body

  var d = new Date(Date.now());
  var diffDays = Math.round(Math.abs((d.getTime() - start.getTime())/(oneDay)));
  var first = parseInt(diffDays / 7) % 4;
  var second = parseInt(diffDays / 7) % 4 + 1;
  if (second == 4) {
    second = 0;
  }

  if (message.text.toLowerCase().indexOf('benny') >= 0 && message.text.toLowerCase().indexOf('tolong') >= 0) {
    var help = message.text.toLowerCase().split("tolong");
    var talk = help[1].split("benny");
axios.post('https://api.telegram.org/bot579651248:AAGsNVCmzkxC2NyhsXAdfx_b0-7JZE_NtsY/sendMessage', {
      chat_id: message.chat.id,
      text: 'bro ' + engineer[first] + ' dan bro ' + engineer[second] + ' tolong' + talk[0]
    })
      .then(response => {
        // We get here if the message was successfully posted
        console.log('Message posted')
        res.end('ok')
      })
      .catch(err => {
        // ...and here if it was not
        console.log('Error :', err)
        res.end('Error :' + err)
      })
  }

  if (message.text.toLowerCase().indexOf('/oncall') >= 0) {
    axios.post('https://api.telegram.org/bot579651248:AAGsNVCmzkxC2NyhsXAdfx_b0-7JZE_NtsY/sendMessage', {
    chat_id: message.chat.id,
    text: 'Pageeeee bro n sis! Utk minggu ini, engineer MVP yg bertugas adalah bro ' + engineer[first] + ' (PIC) dan bro ' + engineer[second]
  })
    .then(response => {
      // We get here if the message was successfully posted
      console.log('Message posted')
      res.end('ok')
    })
    .catch(err => {
      // ...and here if it was not
      console.log('Error :', err)
      res.end('Error :' + err)
    })
  }
  
  return res.end();

});

// Finally, start our server
app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!');
});