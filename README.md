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
  now
  ```
3. Set webhook
  ```
  curl -F "url=https://telegram-bot-xxxxxxxxxx.now.sh/new-message" https://api.telegram.org/bot<your_api_token>/setWebhook
  ```
  Change 'xxxxxxxxxx' to deployed url character
