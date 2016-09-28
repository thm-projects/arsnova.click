#! /bin/bash

#https://github.com/Differential/meteor-mobile-cookbook/blob/master/iOS/Building.md
#https://github.com/meteor/meteor/wiki/How-to-submit-your-Android-app-to-Play-Store

#remove last build files
rm -r .meteor/local/cordova-build/
rm -r ../arsnova.click-build/

#build app
meteor build ../arsnova.click-build/production --server=https://arsnova.click:443
meteor build ../arsnova.click-build/staging --server=http://staging.arsnova.click:80

#Generate Android apk - staging build
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../docs/build/android-release-key.keystore ../arsnova.click-build/staging/android/release-unsigned.apk "arsnova.click"
$ANDROID_HOME/build-tools/24.0.2/zipalign -v 4 ../arsnova.click-build/staging/android/release-unsigned.apk ../arsnova.click-build/arsnova.click-staging.apk

#Generate Android apk - production build
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../docs/build/android-release-key.keystore ../arsnova.click-build/production/android/release-unsigned.apk "arsnova.click"
$ANDROID_HOME/build-tools/24.0.2/zipalign -v 4 ../arsnova.click-build/production/android/release-unsigned.apk ../arsnova.click-build/arsnova.click-production.apk
