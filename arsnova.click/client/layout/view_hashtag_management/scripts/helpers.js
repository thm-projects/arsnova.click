import * as localData from '../../../lib/local_storage.js';

Template.hashtagManagement.helpers({
    serverHashtags: function () {
        return localData.getAllHashtags();
    }
});