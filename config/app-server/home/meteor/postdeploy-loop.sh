#!/bin/sh
#
# This script handles deployments of the Meteor app. It is automatically run on
# server startup and runs continuously.
#
# DO NOT RENAME OR REMOVE!
#

root=/home/meteor
approot=$root/app

while [ true ]; do
  cd $approot
  # Watch file system for modifications
  inotifywait -e modify -e move -e create -e delete .
  # Sleep to give the deployment some time to finish
  sleep 10
  cd $approot/programs/server
  npm install
  # Fibers needs to be upgraded since the outdated version provided by Meteor
  # is not compatible with current versions of NodeJS
  npm install --save fibers@^1.0.7
  cd $root
  # Restart the application
  ./appctl.sh restart
  sleep 30
done
