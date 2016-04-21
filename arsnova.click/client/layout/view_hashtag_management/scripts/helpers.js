import localData from './../../../lib/local_storage';

Template.hashtagManagement.helpers({
    serverHashtags: function () {
        return localData.getAllHashtags();
    }
});