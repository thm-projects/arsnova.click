import  * as localData from '/client/lib/local_storage.js';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

Template.home.helpers({
    existingHashtagsAvailable: function () {
        return Session.get("localStorageAvailable") && localData.getAllHashtags().length > 0;
    }
});