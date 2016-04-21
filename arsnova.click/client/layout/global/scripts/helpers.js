import localData from './../../../lib/local_storage';

Template.home.helpers({
    existingHashtagsAvailable: function () {
        return Session.get("localStorageAvailable") && localData.getAllHashtags().length > 0;
    }
});