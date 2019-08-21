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
var getTeamupTodayEvents = () => axios.create({
  method: 'get',
  baseURL: `https://api.teamup.com/${process.env.TEAMUP_CALENDAR_KEY}/events`,
  timeout: 10000,
  headers: {'Teamup-Token': process.env.TEAMUP_API_KEY}
});
var createTeamupEvent = data => axios.create({
  method: 'post',
  baseURL: `https://api.teamup.com/${process.env.TEAMUP_CALENDAR_KEY}/events`,
  timeout: 10000,
  headers: {'Teamup-Token': process.env.TEAMUP_API_KEY},
  data
});
var updateTeamupEvent = (eventId, data) => axios.create({
  method: 'put',
  baseURL: `https://api.teamup.com/${process.env.TEAMUP_CALENDAR_KEY}/events/${eventId}`,
  timeout: 10000,
  headers: {'Teamup-Token': process.env.TEAMUP_API_KEY},
  data
});
var getJiraIssue = issueKey => axios.create({
  baseURL: `${process.env.JIRA_URL}/rest/api/3/issue/${issueKey}`,
  timeout: 10000,
  headers: {'Authorization': `Basic ${process.env.JIRA_API_KEY}`}
});
var setJiraIssue = (issueKey, data) => axios.create({
  baseURL: `${process.env.JIRA_URL}/rest/api/3/issue/${issueKey}`,
  timeout: 10000,
  headers: {'Authorization': `Basic ${process.env.JIRA_API_KEY}`},
  data
});

// Helpers
const getKeyByValue = (obj, value) =>
  Object.keys(obj).find(key => obj[key] === value)
const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1)
const dateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/

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
      getTeamupTodayEvents().request()
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

const parseAttendance = chatId => {
  getTeamupTodayEvents()
    .request()
    .then(function(response) {
      var events = response.data.events
      var memberInfo = ""
      var botMessage = `Halo halo~\r\nHari ini semua teman-teman ${SQUAD_NAME} available yeay~`
      if (events.length > 0) {
        for (var event of events) {
          for (var member in SQUAD_MEMBERS) {
            for (var nickname of SQUAD_MEMBERS[member]) {
              if (
                event.title.toLowerCase().includes(nickname) ||
                event.who.toLowerCase().includes(nickname)
              ) {
                for (var subid in SUBCALENDAR_IDS) {
                  if (event.subcalendar_id === parseInt(subid)) {
                    memberInfo += ` *${nickname.charAt(0).toUpperCase() +
                      nickname.slice(1)}* lagi *${SUBCALENDAR_IDS[subid]}*,`
                  }
                }
              }
            }
          }
        }
        if (memberInfo) {
          botMessage = `Halo halo~\r\nHari ini${memberInfo} jangan kontak yang lagi cuti/GH/sakit/libur dulu ya guys, hehe`
        }
      }
      axios.post(sendMessageAPI, {
        chat_id: chatId,
        text: botMessage,
        parse_mode: "Markdown"
      })
    })
    .catch(function(error) {
      handleError(message, error)
    })
}

const isAuthorized = message => {
  const username = `@${message.from.username}`
  if (SQUAD_MEMBERS[username]) return true
  axios.post(sendMessageAPI, {
    chat_id: message.chat.id,
    text: `Maaf kak, kamu bukan anggota ${SQUAD_NAME} :(`,
    parse_mode: "HTML"
  })
  return false
}

const handleError = (message, error) => {
  axios.post(sendMessageAPI, {
    chat_id: message.chat.id,
    text: `Ada error masa :( Coba kabarin / tanya kak ${BOT_ADMIN} yaa~`
  })
  console.warn(error)
}

// Health check
app.get('/healthz', function(req, res) {
  res.send('OK');
});

// This is the route the API will call
app.post('/new-message', function(req, res) {
  const { message } = req.body;

  if (typeof message === 'undefined' || typeof message.text === 'undefined') return res.send('OK');
  if (!isAuthorized(message)) return res.send("OK")
  const username = `@${message.from.username}`

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

  if (message.text.toLowerCase().indexOf("/ijin") >= 0) {
    const splittedText = message.text.toLowerCase().split(" ")
    if (splittedText.length < 3) {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text:
          "Use <b>/ijin [cuti|remote|libur|sakit|gh] [today|tomorrow|start_date:YYYY-MM-DD] [end_date(opt):YYYY-MM-DD]</b> to create or update Teamup event\r\nEx: /ijin remote today",
        parse_mode: "HTML"
      })
      return res.send("OK")
    }
    let match = message.text.match(/ijin@?\S* (.*) (.*) (.*)/)
    if (!match) match = message.text.match(/ijin@?\S* (.*) (.*)/)
    const today = new Date()
    if (match[2] === 'today') {
      match[2] = new Date(today).toISOString().substring(0,10)
      match[3] = match[2]
    } else if (match[2] === 'tomorrow') {
      tomorrow = new Date(today).setDate(today.getDate() + 1)
      match[2] = new Date(tomorrow).toISOString().substring(0,10)
      match[3] = match[2]
    }
    if (!dateRegex.test(match[2]) || !dateRegex.test(match[3])) {
      axios.post(sendMessageAPI, {
        chat_id: message.chat.id,
        text:
          "Use <b>/ijin [cuti|remote|libur|sakit|gh] [today|tomorrow|start_date:YYYY-MM-DD] [end_date(opt):YYYY-MM-DD]</b> to create or update Teamup event\r\nEx: /ijin remote today",
        parse_mode: "HTML"
      })
      return res.send("OK")
    }
    const subcalendarType = match[1].toLowerCase()
    const startDate = new Date(match[2]).toISOString()
    const endDate = new Date(match[3]).toISOString()
    const payload = {
      subcalendar_id: getKeyByValue(SUBCALENDAR_IDS, subcalendarType),
      start_dt: startDate,
      end_dt: endDate,
      all_day: true,
      title: capitalize(subcalendarType),
      who: capitalize(SQUAD_MEMBERS[username][0])
    }
    createTeamupEvent(payload)
      .request()
      .then(response => {
        axios.post(sendMessageAPI, {
          chat_id: message.chat.id,
          text:
            "Sip, udah aku submit ke Teamup ya kak, makasih udah ngabarin :)",
          parse_mode: "HTML"
        })
      })
      .catch(message => {
        handleError(message, error)
      })
  }

  if (message.text.toLowerCase().indexOf('/start_group') >= 0) {
    if (username !== BOT_ADMIN) {
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
          const jiraIssues = []
          for (let index = 0; index < cell.length; index+=3) {
            const jiraIssueKey = cell[index].value.match(/[A-Z]+\-\d+/g)
            if ((jiraIssueKey || []).length > 0) {
              jiraIssues[index] = getJiraIssue(jiraIssueKey[0]).get()
            }
          }
          var number = 1;
          Promise.all(jiraIssues.map(x => x.then(y=>y.data))).then(issues => {
            for (let index = 0; index < cell.length; index+=3) {
              var prLink = cell[index].value;
              if (cell[index+2].value != '-') {
                prLink = '<a href=\"' + cell[index+2].value + '\">' + cell[index].value + '</a>';
              }
              const assignee = ((issues[index] || {}).fields || {}).assignee ? `(${issues[index].fields.assignee.displayName})` : ''
              development = development.concat(`${number}. ${prLink} <b>${cell[index+1].value}</b> ${assignee}\r\n`);
              number++;
            }
            axios.post(sendMessageAPI, {
              chat_id: message.chat.id,
              text: 'Status Development:\r\n' + development,
              parse_mode: "HTML"
            })
          }).catch(error => {
            handleError(message, error)
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
    if (Object.keys(SQUAD_MEMBERS).includes(username)) {
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
      text: `<b>/add [task name] [PR/JIRA link (optional)]</b>: Add new task\r\n<b>/done [task number] [PR/JIRA link (optional)]</b>: Move task to the next step\r\n<b>/revert [task number]</b>: Revert task one step\r\n<b>/fix [task number]</b>: Move task to "In Progress ✍️"\r\n<b>/link [task number] [PR link (optional)]</b>: Show or update PR/JIRA link\r\n<b>/development</b>: View all development status\r\n<b>/oncall</b>: View oncall Engineer\r\n<b>/attendance</b>: View attendance report\r\n<b>/ijin [cuti|remote|libur|sakit|gh] [today|tomorrow|start_date:YYYY-MM-DD] [end_date(opt):YYYY-MM-DD]</b>: create or update Teamup event\r\n\r\nAsk ${BOT_ADMIN} for more information`,
      parse_mode: "HTML"
    })
  }
  
  return res.send('OK');

});

// Finally, start our server
app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!');
});
