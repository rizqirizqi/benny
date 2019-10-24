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

## Deployment
1. Install `now` service
  ```
  npm install -g now
  ```
2. Copy the deployment script and modify the env from `deploy.sh.sample` if needed
  ```
  cp deploy.sh.sample deploy.sh
  chmod +x deploy.sh
  ```
3. Run deployment script
  ```
  ./deploy.sh
  ```
