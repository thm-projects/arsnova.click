#!/bin/sh
#
# This script starts the Meteor app. It is automatically run on server startup.
#
# DO NOT RENAME OR REMOVE!
#

logfile=$HOME/logs/app.log
pidfile=$HOME/postdeploy-loop.pid

export MONGO_URL=mongodb://meteor:meteor@localhost/staging
export NODE_ENV=staging
export PORT=3000
export ROOT_URL=http://wpw-ws1516.mni.thm.de

cd $HOME/app || exit 1

case "$1" in
  start)
    echo Starting app...
    forever start main.js
    if [ ! -f "$pidfile" ] ; then
      echo Starting post-deploy loop...
      cd $HOME
      nohup ./postdeploy-loop.sh 2>&1 &
      echo $! >"$pidfile"
    else
      echo "Post-deploy loop is already running ('$pidfile' exists)."
    fi
  ;;

  stop)
    echo Stopping app...
    if [ -f "$pidfile" ] ; then
      pids=$(pgrep -P $(cat "$pidfile"))
      kill $(cat "$pidfile") && kill $pids && rm "$pidfile"
    else
      echo "Post-deploy loop is not running."
    fi
    forever stop main.js
  ;;

  restart)
    echo Restarting app...
    if [ -f "$pidfile" ] ; then
      forever restart main.js
    else
      echo "Post-deploy loop is not running."
    fi
  ;;

  *)
    echo "Usage:" $_ "start|stop|restart"
  ;;
esac
