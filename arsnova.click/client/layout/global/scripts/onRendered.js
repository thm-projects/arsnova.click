import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import  * as localData from '/client/lib/local_storage.js';
import { Splashscreen } from '/client/plugins/splashscreen/scripts/splashscreen.js';
import * as lib from './lib.js';

Template.home.onRendered(function() {
    if(Session.get("localStorageAvailable") && localData.getAllHashtags().length > 0) {
        lib.setHashtagSplashscreen(new Splashscreen({
            autostart: true,
            templateName: "showHashtagsSplashscreen",
            closeOnClick: true
        }));
    }
});