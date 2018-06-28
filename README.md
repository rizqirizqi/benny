# Benny
Telegram Bot for o2o_mvp operation

## Owner
O2O MVP Squad

## Prerequisite
1. Npm 4.2.0

## Installation
1. Clone Benny
  ```
  git clone https://github.com/azkidarmawan/benny.git
  cd benny
  ```
2. Run
  ```
  node index.js
  ```

## Up and Running
1. Run `now` service
  ```
  now
  ```
2. Set webhook
  ```
  curl -F "url=https://telegram-bot-xxxxxxxxxx.now.sh/new-message"  https://api.telegram.org/bot<your_api_token>/setWebhook
  ```
  Change 'xxxxxxxxxx' to deployed url character