#!/bin/bash

# any future command that fails will exit the script
set -e

# write the public key of our aws instance
eval $(ssh-agent -s)
echo "$PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null

# disable the host key checking.
mkdir -p ~/.ssh 
touch ~/.ssh/config
echo -e "Host *\n\tStrictHostKeyChecking no\n\n" >> ~/.ssh/config

# comma seperated values of ip addresses of the server instances.
DEPLOY_SERVERS=$DEPLOY_SERVERS

# seperate servers
ALL_SERVERS=(${DEPLOY_SERVERS//,/ })
echo "ALL_SERVERS ${ALL_SERVERS}"

# loop multiple EC2 instance
for server in "${ALL_SERVERS[@]}"
do
  echo "deploying to ${server}"
  ssh ubuntu@${server} 'bash' < ./deployAWS/updateAndRestart.sh
done