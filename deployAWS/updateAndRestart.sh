#!/bin/bash

# any future command that fails will exit the script
set -e

# Update  path inorder to use npm and pm2 commands
export PATH="/home/ubuntu/.nvm/versions/node/v19.0.0/lib/node_modules/npm/bin:$PATH"
export PATH="/home/ubuntu/.nvm/versions/node/v19.0.0/bin:$PATH"
export PATH="/home/ubuntu/.nvm/versions/node/v19.0.0/lib/node_modules/pm2/bin:$PATH"

cd huddleup
cd backend

pm2 list

# stop, update, and restart service 
# pm2 delete backend 

git fetch
git checkout ci-deployment
git pull

npx prisma generate

npm i
echo "Starting..."
pm2 start npm --name "backend" -- start
