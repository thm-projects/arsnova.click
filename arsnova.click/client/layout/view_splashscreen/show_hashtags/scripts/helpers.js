import { Template } from 'meteor/templating';
import  * as localData from '/client/lib/local_storage.js';

Template.showHashtagsSplashscreen.helpers({
    hashtags: function () {
        return localData.getAllHashtags();
    }
});