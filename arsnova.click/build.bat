@echo off
rmdir /S /Q .meteor\local\
rmdir /S /Q ..\arsnova.click-build\
meteor build --debug ..\arsnova.click-build\production --server=https://arsnova.click:443
"C:\Program Files\Java\jdk1.8.0_102\bin\jarsigner.exe" -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../docs/build/android-release-key.keystore ../arsnova.click-build/production/android/release-unsigned.apk "arsnova.click"
%ANDROID_HOME%/build-tools/24.0.2/zipalign -v 4 ../arsnova.click-build/production/android/release-unsigned.apk ../arsnova.click-build/arsnova.click-production.apk
exit
