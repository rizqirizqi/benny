# Benny
Telegram Bot for o2o_mvp operation

## Owner
[O2O MVP Squad]

## Prerequisite
1. Npm 4.2.0

## Installation
1. Clone Benny
  ```
  git clone https://github.com/azkidarmawan/benny.git
  cd benny
  ```
2. Install Dependency
  ```
  npm init
  npm install --save express axios body-parser
  ```
4. Run
  ```
  node index.js
  ```

## Up and Running
1. Install now service
  ```
  npm install -g now
  ```
2. Add a start script to your package.json file
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    ```
    "start" : "node index.js"
    ```
  },
3. Run
  ```
  now
  ```
4. Set webhook
  ```
  curl -F "url=https://telegram-bot-xxxxxxxxxx.now.sh/new-message"  https://api.telegram.org/bot<your_api_token>/setWebhook
  ```
  Change 'xxxxxxxxxx' to deployed url character