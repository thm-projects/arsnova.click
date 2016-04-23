import { Template } from 'meteor/templating';
import * as localData from '/client/lib/local_storage.js';

Template.hashtagManagement.helpers({
    serverHashtags: function () {
        return localData.getAllHashtags();
    }
});

Template.showHashtagsSplashscreen.helpers({
    hashtags: function () {
        return localData.getAllHashtags();
    }
});