#! /bin/bash

#https://github.com/Differential/meteor-mobile-cookbook/blob/master/iOS/Building.md

#remove last build files
rm -r .meteor/local/cordova-build/
rm -r arsnova.click-build/

#build app
meteor build arsnova.click-build --server=http://arsnova.click:80

#Generate Android apk
cd arsnova.click-build/android/
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 release-unsigned.apk arsnova.click
$ANDROID_HOME/build-tools/23.0.2/zipalign 4 release-unsigned.apk ../arsnova.click-production.apk