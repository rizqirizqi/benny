# Windibot
Telegram Bot for O2O-Mitra
(forked from https://github.com/azkidarmawan/benny)

## Owner
O2O-Mitra Squad

## Prerequisite
1. Npm 4.2.0

2. Google Spreadsheet Service Account API Config

## Installation
1. Clone
  ```
  git clone https://github.com/rizqirizqi/windibot.git
  cd windibot
  ```
2. Run
  ```
  node index.js
  ```

## Up and Running
1. Install `now` service
  ```
  npm install -g now
  ```
2. Run `now` service
  ```
  now --public\
    -e BOT_NAME=WindiBot\
    -e PRIVATE_KEY_ID=\
    -e BOT_TOKEN=\
    -e SPREADSHEET_ID=\
    -e TEAMUP_CALENDAR_KEY=\
    -e TEAMUP_API_KEY=\
    -e JIRA_URL=\
    -e JIRA_API_KEY=
  ```
3. Set webhook
  ```
  curl -F "url=https://xxxxx.now.sh/new-message" https://api.telegram.org/bot<your_api_token>/setWebhook
  ```
  Change 'xxxxx' to deployed url character
