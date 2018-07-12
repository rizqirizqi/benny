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

var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');

// Create a document object using the ID of the spreadsheet - obtained from its URL.
var doc = new GoogleSpreadsheet('your_spreadsheet_id');

// API for send a message
var sendMessageAPI = 'https://api.telegram.org/bot614818563:AAFcm-bEILWPnkj8oKNSUupdEy3snLj0meU/sendMessage';

//This is the route the API will call
app.post('/new-message', function(req, res) {
  const {message} = req.body

  if (message.text.toLowerCase().indexOf('eddy') >= 0 && message.text.toLowerCase().indexOf('tolong') >= 0) {
    var help = message.text.toLowerCase().split("tolong");
    var talk = help[1].split("eddy");
    // Authenticate with the Google Spreadsheets API.
    doc.useServiceAccountAuth(creds, function (err) {
      // Get the cells from the first row of the spreadsheet.
      doc.getCells(1,
        {
          "max-row": 1
        }
        , function (err, cells) {
        var d = new Date(Date.now());
        var diffDays = Math.round(Math.abs((d.getTime() - start.getTime())/(oneDay)));
        var first = parseInt(diffDays / 7) % cells.length;
        var second = parseInt(diffDays / 7) % cells.length + 1;
        if (second == cells.length) {
          second = 0;
        }
        axios.post(sendMessageAPI, {
          chat_id: message.chat.id,
          text: 'bro ' + cells[first].value + ' dan bro ' + cells[second].value + ' tolong' + talk[0]
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
      });
    });
  }

  if (message.text.toLowerCase().indexOf('/oncall') >= 0) {
    // Authenticate with the Google Spreadsheets API.
    doc.useServiceAccountAuth(creds, function (err) {
      // Get the cells from the first row of the spreadsheet.
      doc.getCells(1,
        {
          "max-row": 1
        }
        , function (err, cells) {
        var d = new Date(Date.now());
        var diffDays = Math.round(Math.abs((d.getTime() - start.getTime())/(oneDay)));
        var first = parseInt(diffDays / 7) % cells.length;
        var second = parseInt(diffDays / 7) % cells.length + 1;
        if (second == cells.length) {
          second = 0;
        }
        axios.post(sendMessageAPI, {
          chat_id: message.chat.id,
          text: 'Pageeeee bro n sis! Utk minggu ini, engineer MVP yg bertugas adalah bro ' + cells[first].value + ' (PIC) dan bro ' + cells[second].value
        })
      });
    });
  }

  if (message.text.toLowerCase().indexOf('/add') >= 0) {
    var help = message.text.toLowerCase().split(" ");
    if (help.length < 2 || help[1] == "") {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: 'Use <b>/add [task name]</b> to add new task',
        parse_mode: "HTML"
      })
    } else {
      var task = message.text.match(/add (.*)/);
      // Authenticate with the Google Spreadsheets API.
      doc.useServiceAccountAuth(creds, function (err) {
        doc.getCells(1,
          {
            "min-row": 2,
            "max-row": 2
          }
          , function (err, cells) {
          doc.getCells(1,
            {
              "min-row": 3 + cells[0].numericValue,
              "max-row": 3 + cells[0].numericValue,
              "max-col": 5,
              "return-empty": true
            }
            , function (err, cell) {
            var d = new Date(Date.now()).toLocaleString();
            cell[0].setValue(task[1], function (err, cel) {});
            cell[1].setValue('In Progress ✍️', function (err, cel) {});
            cell[2].setValue('-', function (err, cel) {});
            cell[3].setValue(d, function (err, cel) {});
            cell[4].setValue(d, function (err, cel) {});
          });
        });
      });
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: '<b>' + task[1] + '</b> has been added',
        parse_mode: "HTML"
      })
    }
  }

  if (message.text.toLowerCase().indexOf('/development') >= 0) {
    var development = '';
    // Authenticate with the Google Spreadsheets API.
    doc.useServiceAccountAuth(creds, function (err) {
      doc.getCells(1,
        {
          "min-row": 2,
          "max-row": 2
        }
        , function (err, cells) {
        doc.getCells(1,
          {
            "min-row": 3,
            "max-row": 3 + cells[0].numericValue,
            "max-col": 3
          }
          , function (err, cell) {
          var number = 1;
          for (let index = 0; index < cell.length; index+=3) {
            var prLink = cell[index].value;
            if (cell[index+2].value != '-') {
              prLink = '<a href=\"' + cell[index+2].value + '\">' + cell[index].value + '</a>';
            }
            development = development.concat(number + '. ' + prLink + ' <b>' + cell[index+1].value + '</b>\r\n');
            number++;
          }
          axios.post(sendMessageAPI, {
            chat_id: message.chat.id,
            text: 'Status Development:\r\n' + development,
            parse_mode: "HTML"
          })
        });
      });
    });
  }

  if (message.text.toLowerCase().indexOf('/done') >= 0) {
    var help = message.text.toLowerCase().split(" ");
    if (help.length < 2 || help[1] == "" || isNaN(help[1])) {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: 'Use <b>/done [task number] [PR link (optional)]</b> to move task to next step',
        parse_mode: "HTML"
      })
    } else {
      var num = message.text.match(/done (.*)/);
      var links = num[1].split(' ');
      var number = links[0];
      var link = '-';
      // Authenticate with the Google Spreadsheets API.
      doc.useServiceAccountAuth(creds, function (err) {
        doc.getCells(1,
          {
            "min-row": 3 + parseInt(number) - 1,
            "max-row": 3 + parseInt(number) - 1,
            "min-col": 1,
            "max-col": 4
          }
          , function (err, cells) {
          if (links.length > 1) {
            link = links[1];
            cells[2].setValue(link, function (err, c) {});
          }
          var d = new Date(Date.now()).toLocaleString();
          cells[3].setValue(d, function (err, c) {});
          if (cells[1].value == 'In Progress ✍️'){
            cells[1].setValue('Code Review 📜', function (err, c) {});
          } else if (cells[1].value == 'Code Review 📜'){
            cells[1].setValue('QA Testing 🤔', function (err, c) {});
          } else if (cells[1].value == 'QA Testing 🤔'){
            cells[1].setValue('Automation Testing 🔁', function (err, c) {});
          } else if (cells[1].value == 'Automation Testing 🔁'){
            cells[1].setValue('Ready to Deploy 💡', function (err, c) {});
          } else if (cells[1].value == 'Ready to Deploy 💡'){
            cells[1].setValue('Merged 🔯', function (err, c) {});
          } else {
            cells[1].setValue('DONE ✅', function (err, c) {});
          }
          var prLink = cells[0].value;
          if (cells[2].value != '-') {
            prLink = '<a href=\"' + cells[2].value + '\">' + cells[0].value + '</a>';
          }
          axios.post(sendMessageAPI, {
            chat_id: message.chat.id,
            text: prLink + ' <b>' + cells[1].value + '</b> now',
            parse_mode: "HTML"
          })
        });
      });
    }
  }

  if (message.text.toLowerCase().indexOf('/revert') >= 0) {
    var help = message.text.toLowerCase().split(" ");
    if (help.length < 2 || help[1] == "" || isNaN(help[1])) {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: 'Use <b>/revert [task number]</b> to revert task one step',
        parse_mode: "HTML"
      })
    } else {
      var num = message.text.match(/revert (.*)/);
      var number = num[1];
      // Authenticate with the Google Spreadsheets API.
      doc.useServiceAccountAuth(creds, function (err) {
        doc.getCells(1,
          {
            "min-row": 3 + parseInt(number) - 1,
            "max-row": 3 + parseInt(number) - 1,
            "min-col": 1,
            "max-col": 4
          }
          , function (err, cells) {
          var d = new Date(Date.now()).toLocaleString();
          cells[3].setValue(d, function (err, c) {});
          if (cells[1].value == 'DONE ✅'){
            cells[1].setValue('Merged 🔯', function (err, c) {});
          } else if (cells[1].value == 'Merged 🔯'){
            cells[1].setValue('Ready to Deploy 💡', function (err, c) {});
          } else if (cells[1].value == 'Ready to Deploy 💡'){
            cells[1].setValue('Automation Testing 🔁', function (err, c) {});
          } else if (cells[1].value == 'Automation Testing 🔁'){
            cells[1].setValue('QA Testing 🤔', function (err, c) {});
          } else if (cells[1].value == 'QA Testing 🤔'){
            cells[1].setValue('Code Review 📜', function (err, c) {});
          } else {
            cells[1].setValue('In Progress ✍️', function (err, c) {});
          }
          var prLink = cells[0].value;
          if (cells[2].value != '-') {
            prLink = '<a href=\"' + cells[2].value + '\">' + cells[0].value + '</a>';
          }
          axios.post(sendMessageAPI, {
            chat_id: message.chat.id,
            text: prLink + ' <b>' + cells[1].value + '</b> now',
            parse_mode: "HTML"
          })
        });
      });
    }
  }

  if (message.text.toLowerCase().indexOf('/fix') >= 0) {
    var help = message.text.toLowerCase().split(" ");
    if (help.length < 2 || help[1] == "" || isNaN(help[1])) {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: 'Use <b>/fix [task number]</b> to revert task to development step',
        parse_mode: "HTML"
      })
    } else {
      var num = message.text.match(/fix (.*)/);
      var number = num[1];
      // Authenticate with the Google Spreadsheets API.
      doc.useServiceAccountAuth(creds, function (err) {
        doc.getCells(1,
          {
            "min-row": 3 + parseInt(number) - 1,
            "max-row": 3 + parseInt(number) - 1,
            "min-col": 1,
            "max-col": 4
          }
          , function (err, cells) {
          var d = new Date(Date.now()).toLocaleString();
          cells[1].setValue('In Progress ✍️', function (err, c) {});
          cells[3].setValue(d, function (err, c) {});
          var prLink = cells[0].value;
          if (cells[2].value != '-') {
            prLink = '<a href=\"' + cells[2].value + '\">' + cells[0].value + '</a>';
          }
          axios.post(sendMessageAPI, {
            chat_id: message.chat.id,
            text: prLink + ' <b>' + cells[1].value + '</b> now',
            parse_mode: "HTML"
          })
        });
      });
    }
  }

  if (message.text.toLowerCase().indexOf('/link') >= 0) {
    var help = message.text.toLowerCase().split(" ");
    if (help.length < 2 || help[1] == "" || isNaN(help[1])) {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: 'Use <b>/link [task number] [PR link (optional)]</b> to show/update PR link',
        parse_mode: "HTML"
      })
    } else {
      var num = message.text.match(/link (.*)/);
      var links = num[1].split(' ');
      var number = links[0];
      var link = '-';
      // Authenticate with the Google Spreadsheets API.
      doc.useServiceAccountAuth(creds, function (err) {
        doc.getCells(1,
          {
            "min-row": 3 + parseInt(number) - 1,
            "max-row": 3 + parseInt(number) - 1,
            "min-col": 1,
            "max-col": 3
          }
          , function (err, cells) {
          if (links.length > 1) {
            link = links[1];
            cells[2].setValue(link, function (err, c) {});
          }
          var prLink = '<i>no available link yet</i>';
          if (cells[2].value != '-') {
            prLink = '<a href=\"' + cells[2].value + '\">' + cells[2].value + '</a>';
          }
          axios.post(sendMessageAPI, {
            chat_id: message.chat.id,
            text: cells[0].value + ' <b>' + cells[1].value + '</b> [' + prLink + ']',
            parse_mode: "HTML"
          })
        });
      });
    }
  }

  if (message.text.toLowerCase().indexOf('/help') >= 0) {
    axios.post(sendMessageAPI, {
      chat_id: message.chat.id,
      text: 'Use <b>/add [task name]</b> to add new task\r\nUse <b>/done [task number] [PR link (optional)]</b> to move task to next step\r\nUse <b>/revert [task number]</b> to revert task one step\r\nUse <b>/fix [task number]</b> to revert task to development step\r\nUse <b>/link [task number] [PR link (optional)]</b> to show/update PR link\r\nUse <b>/development</b> to view all development status\r\nUse <b>/oncall</b> to view oncall Engineer\r\nAsk @azkidarmawan for more information',
      parse_mode: "HTML"
    })
  }
  
  return res.end();

});

// Finally, start our server
app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!');
});