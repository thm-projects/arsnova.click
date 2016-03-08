Template.home.helpers({
    existingHashtagsAvailable: function () {
        if (localData.getAllHashtags().length == 0){
            return false;
        }
        return true;
    }
});