#!/bin/bash

# any future command that fails will exit the script
set -e

# Update  path inorder to use npm and pm2 commands
export PATH="/home/ubuntu/.nvm/versions/node/v19.0.0/lib/node_modules/npm/bin:$PATH"
export PATH="/home/ubuntu/.nvm/versions/node/v19.0.0/bin:$PATH"
export PATH="/home/ubuntu/.nvm/versions/node/v19.0.0/lib/node_modules/pm2/bin:$PATH"

# stop, update, and restart service 
cd huddleup
cd backend
#TODO: update when backend is working with pm2
# pm2 delete webapp 
git checkout ci-deployment
git pull
npm i
npm run build
npm run dev
# pm2 start npm --name "webapp" -- start
