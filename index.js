require('dotenv').config();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const axios = require('axios')

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded

process.on('unhandledRejection', (reason) => {
  console.log('Unhandled Rejection: ' + reason);
  // application specific logging, throwing an error, or other logic here
});

var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
var start = new Date('2018-04-23');

var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.js');

// Create a document object using the ID of the spreadsheet - obtained from its URL.
var doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);

// API
var sendMessageAPI = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
var getTeamupTodayEvents = axios.create({
  baseURL: `https://api.teamup.com/${process.env.TEAMUP_CALENDAR_KEY}/events`,
  timeout: 5000,
  headers: {'Teamup-Token': process.env.TEAMUP_API_KEY}
});

// Bot Name
var bot = process.env.BOT_NAME;

var BOT_ADMIN = '@mgsrizqi'

var SQUAD_NAME = 'O2O-Mitra'

// FULL SQUAD MEMBERS
var SQUAD_MEMBERS = {
  '@anansyahsaiful': ['ipul', 'saiful'],
  '@andi_h': ['andi'],
  '@ayynurp': ['aya', 'wayan'],
  '@benyliantriana': ['beny'],
  '@damaera': ['luthfi', 'damaera'],
  '@dimasdanz': ['dimas'],
  '@dendynp': ['dendy'],
  '@fadilmuhput': ['fadil'],
  '@faroukrizki': ['farouk'],
  '@ifanasution': ['ifa'],
  '@Iqbalmabbit': ['mabbit'],
  '@juan_anton': ['juan'],
  '@liemhindrasanjaya': ['hindra'],
  '@mgsrizqi': ['mgsrizqi'],
  '@nizwafay': ['papay', 'nizwa'],
  '@ochaadeea': ['ocha', 'zakina'],
  '@PhantomX7': ['kenichi'],
  '@rahmisr': ['rahmi'],
  '@rahmatrasyidi': ['rasyidi'],
  '@reditaliskiyari': ['redit'],
  '@rianadw': ['riana'],
  '@rynaldoryan': ['ryan'],
  '@ucupsaklek': ['ucup'],
  '@wahymaulana': ['wahyu'],
  '@widyakumara': ['dewa'],
  '@williamlazuardi': ['william', 'lazuardi'],
  '@windiany': ['windi'],
  '@ywardhana25': ['yayan', 'yulistian'],
  '@zitanada': ['zita']
}
WATER_TRIBE_MEMBER = [
  '@anansyahsaiful',
  '@ifanasution',
  '@Iqbalmabbit',
  '@ucupsaklek',
  '@wahymaulana',
  '@widyakumara',
  '@windiany',
  '@zitanada'
]

var SUBCALENDAR_IDS = {
  3823675: 'cuti',
  3823676: 'remote',
  4461179: 'libur',
  3824264: 'sakit',
  3823674: 'GH'
}

const storage = require('node-persist');
storage.init();

var CronJob = require('cron').CronJob;

var standupJob = function() {
  console.log('' + Date.now() + ' Sending Standup Meeting reminder... ');
  storage.getItem('registeredGroupId')
  .then(function(registeredGroupId) {
    if (registeredGroupId) {
      var standupAnnouncement = 'HEY‼️‼️‼️ AYOO~ STANDUP‼️‼️‼️\r\nHEY‼️‼️‼️ AYOO~ STANDUP‼️‼️‼️\r\nHEY‼️‼️‼️ AYOO~ STANDUP‼️‼️‼️\r\nHEY‼️‼️‼️ AYOO~ STANDUP‼️‼️‼️\r\nHEY‼️‼️‼️ AYOO~ STANDUP‼️‼️‼️'
      getTeamupTodayEvents.get()
        .then(function(response) {
          var events = response.data.events;
          var memberNotAvailable = [...WATER_TRIBE_MEMBER];
          var notAvailableTypes = [3823675, 4461179, 3824264, 3823674];
          if (events.length > 0) {
            for (var event of events) {
              for (var member in SQUAD_MEMBERS) {
                for (var nickname of SQUAD_MEMBERS[member]) {
                  if (event.title.toLowerCase().includes(nickname) || event.who.toLowerCase().includes(nickname)) {
                    if (notAvailableTypes.includes(event.subcalendar_id)) {
                      memberNotAvailable.push(member);
                    }
                  }
                }
              }
            }
          }
          for (var member in SQUAD_MEMBERS) {
            if (!memberNotAvailable.includes(member)) {
              standupAnnouncement += `\r\n${member}`;
            }
          }
          axios.post(sendMessageAPI, {
            chat_id: registeredGroupId,
            text: standupAnnouncement
          })
        })
        .catch(function(error) {
          console.warn('Register the group ID first!')
        });
    }
  })
  .catch(function() {
    console.warn('ERROR HAPPENED WHILE SENDING A REMINDER!');
  })
}
var attendanceJob = function() {
  console.log('' + Date.now() + ' Checking attendance... ');
  storage.getItem('registeredGroupId')
  .then(function(registeredGroupId) {
    if (registeredGroupId) {
      parseAttendance(registeredGroupId);
    }
  })
  .catch(function() {
    console.warn('ERROR HAPPENED WHILE CHECKING ATTENDANCE!');
  })
}
var crons = {
  standup14: new CronJob('00 30 11 * * 1-4', standupJob, null, true, 'Asia/Jakarta'),
  standup5: new CronJob('00 00 11 * * 5', standupJob, null, true, 'Asia/Jakarta'),
  attendance: new CronJob('00 00 09 * * 1-5', attendanceJob, null, true, 'Asia/Jakarta'),
}

function parseAttendance(chatId) {
  getTeamupTodayEvents.get()
    .then(function(response) {
      var events = response.data.events;
      var memberInfo = '';
      var botMessage = `Halo halo~\r\nHari ini semua teman-teman ${SQUAD_NAME} available yeay~`;
      if (events.length > 0) {
        for (var event of events) {
          for (var member in SQUAD_MEMBERS) {
            for (var nickname of SQUAD_MEMBERS[member]) {
              if (event.title.toLowerCase().includes(nickname) || event.who.toLowerCase().includes(nickname)) {
                for (var subid in SUBCALENDAR_IDS) {
                  if (event.subcalendar_id === parseInt(subid)) {
                    memberInfo += ` *${nickname.charAt(0).toUpperCase() + nickname.slice(1)}* lagi *${SUBCALENDAR_IDS[subid]}*,`;
                  }
                }
              }
            }
          }
        }
        if (memberInfo) {
          botMessage = `Halo halo~\r\nHari ini${memberInfo} jangan kontak yang lagi cuti/GH/sakit/libur dulu ya guys, hehe`;
        }
      }
      axios.post(sendMessageAPI, {
        chat_id: chatId,
        text: botMessage,
        parse_mode: "Markdown"
      })
    })
    .catch(function(error) {
      axios.post(sendMessageAPI, {
        chat_id: chatId,
        text: `Ada error masa :( kabarin ${BOT_ADMIN} yaa~`
      })
    })
}

// Health check
app.get('/healthz', function(req, res) {
  res.send('OK');
});

// This is the route the API will call
app.post('/new-message', function(req, res) {
  const { message } = req.body;

  if (typeof message === 'undefined' || typeof message.text === 'undefined') return res.send('OK');

  if (message.text.toLowerCase().indexOf('/registered_group') >= 0) {
    storage.getItem('registeredGroupId')
    .then(function(registeredGroupId) {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: registeredGroupId || 'Nothing is registered.'
      })
    })
    .catch(function(error) {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: error
      })
    })
  }

  if (message.text.toLowerCase().indexOf('/attendance') >= 0) {
    parseAttendance(message.chat.id);
  }

  if (message.text.toLowerCase().indexOf('/start_group') >= 0) {
    if (`@${message.from.username}` !== BOT_ADMIN) {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: `Maaf kak, cuma kak ${BOT_ADMIN} yg bisa ngestart group, hehe`
      })
      return res.send('OK');
    }
    var num = message.text.match(/start_group@?\S* (.*)/);
    var groupId = num && num.length > 1 ? num[1] : '';
    var groupToRegister = groupId || message.chat.id;
    storage.setItem('registeredGroupId', groupToRegister)
    .then(function() {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: 'Registered! :D'
      })
    })
    .catch(function(error) {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: error
      })
    })
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
          text: `On-Call Engineers ${SQUAD_NAME}: ${cells[first].value} dan ${cells[second].value}`
        })
      });
    });
  }

  if (message.text.toLowerCase().indexOf('/add') >= 0) {
    var help = message.text.toLowerCase().split(" ");
    if (help.length < 2 || help[1] == "") {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: 'Use <b>/add [task name] [PR/JIRA link (optional)]</b> to add new task',
        parse_mode: "HTML"
      })
    } else {
      var num = message.text.match(/add@?\S* (.*) (.*)/);
      var task = '';
      var link = '-';
      if (num) {
        task = num && num.length > 1 ? num[1] : '';
        link = num && num.length > 2 ? num[2] : '-';
      } else {
        num = message.text.match(/add@?\S* (.*)/);
        task = num && num.length > 1 ? num[1] : '';
      }
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
            cell[0].setValue(task, function (err, cel) {});
            cell[1].setValue('In Progress ✍️', function (err, cel) {});
            cell[2].setValue(link, function (err, cel) {});
            cell[3].setValue(d, function (err, cel) {});
            cell[4].setValue(d, function (err, cel) {});
          });
        });
      });
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: '<b>' + task + '</b> has been added',
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
        text: 'Use <b>/done [task number] [PR/JIRA link (optional)]</b> to move task to next step',
        parse_mode: "HTML"
      })
    } else {
      var num = message.text.match(/done@?\S* (.*) (.*)/);
      var number = '';
      var link = '-';
      if (num) {
        number = num && num.length > 1 ? num[1] : '';
        link = num && num.length > 2 ? num[2] : '-';
      } else {
        num = message.text.match(/done@?\S* (.*)/);
        number = num && num.length > 1 ? num[1] : '';
      }
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
          if (cells[1].value == 'In Progress ✍️'){
            cells[1].setValue('Code Review 📜', function (err, c) {});
          } else if (cells[1].value == 'Code Review 📜'){
            cells[1].setValue('QA Testing 🤔', function (err, c) {});
          } else if (cells[1].value == 'QA Testing 🤔'){
            cells[1].setValue('Ready to Deploy 💡', function (err, c) {});
          } else if (cells[1].value == 'Ready to Deploy 💡'){
            cells[1].setValue('Merged 🔯', function (err, c) {});
          } else {
            cells[1].setValue('DONE ✅', function (err, c) {});
          }
          if (link != '-') {
            cells[2].setValue(link, function (err, c) {});
          }
          var task = cells[0].value;
          axios.post(sendMessageAPI, {
            chat_id: message.chat.id,
            text: task + ' <b>' + cells[1].value + '</b> now',
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
      var num = message.text.match(/revert@?\S* (.*)/);
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
      var num = message.text.match(/fix@?\S* (.*)/);
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
        text: 'Use <b>/link [task number] [PR/JIRA link (optional)]</b> to show or update PR/JIRA link',
        parse_mode: "HTML"
      })
    } else {
      var num = message.text.match(/link@?\S* (.*) (.*)/);
      var number = '';
      var link = '-';
      if (num) {
        number = num && num.length > 1 ? num[1] : '';
        link = num && num.length > 2 ? num[2] : '-';
      } else {
        num = message.text.match(/link@?\S* (.*)/);
        number = num && num.length > 1 ? num[1] : '';
      }
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
          cells[2].setValue(link, function (err, c) {});
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

  if (message.text.toLowerCase().indexOf('/start') >= 0) {
    if (Object.keys(SQUAD_MEMBERS).includes(`@${message.from.username}`)) {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: `Halo ${message.from.first_name}! Kenalin, aku WindiBot, yg bakal nemenin kamu selama kamu berada di squad ${SQUAD_NAME}! :D`,
      })
    } else {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text: `Halo ${message.from.first_name}! Ada apa ya? Kabarin kak ${BOT_ADMIN} ya kalo ada apa-apa :)`,
      })
    }
  }

  if (message.text.toLowerCase().indexOf('/help') >= 0) {
    axios.post(sendMessageAPI, {
      chat_id: message.chat.id,
      text: `<b>/add [task name] [PR/JIRA link (optional)]</b>: Add new task\r\n<b>/done [task number] [PR/JIRA link (optional)]</b>: Move task to the next step\r\n<b>/revert [task number]</b>: Revert task one step\r\n<b>/fix [task number]</b>: Move task to `in progress`\r\n<b>/link [task number] [PR link (optional)]</b>: Show or update PR/JIRA link\r\n<b>/development</b>: View all development status\r\n<b>/oncall</b>: View oncall Engineer\r\n\r\nAsk ${BOT_ADMIN} for more information`,
      parse_mode: "HTML"
    })
  }
  
  return res.send('OK');

});

// Finally, start our server
app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!');
});
