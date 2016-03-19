#! /bin/bash

#https://github.com/Differential/meteor-mobile-cookbook/blob/master/iOS/Building.md

#android build
#https://github.com/meteor/meteor/wiki/How-to-submit-your-Android-app-to-Play-Store

#remove last build files
rm -r .meteor/local/cordova-build/
rm -r arsnova.click-build/

#build app
meteor build arsnova.click-build --server=http://arsnova.click:80

#Generate Android apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../docs/build/android-release-key.keystore ./arsnova.click-build/android/release-unsigned.apk  arsnova.click
$ANDROID_HOME/build-tools/23.0.2/zipalign -v 4 ./arsnova.click-build/android/release-unsigned.apk ./arsnova.click-build/arsnova.click-production.apk