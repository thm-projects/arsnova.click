import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import  * as localData from '/client/lib/local_storage.js';
import { Splashscreen } from '/client/plugins/splashscreen/scripts/lib.js';
import * as hashtagLib from '/client/layout/view_hashtag_management/scripts/lib.js';

Template.home.onRendered(function() {
    if(Session.get("localStorageAvailable") && localData.getAllHashtags().length > 0) {
        hashtagLib.setHashtagSplashscreen(new Splashscreen({
            autostart: true,
            templateName: "showHashtagsSplashscreen"
        }));
    }
});