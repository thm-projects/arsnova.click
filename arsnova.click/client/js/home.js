Template.home.helpers({
    existingHashtagsAvailable: function () {
        if (getAllHashtagsFromLocalStorage().length == 0){
            return false;
        }
        return true;
    }
});