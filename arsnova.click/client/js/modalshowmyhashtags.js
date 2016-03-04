Template.modalShowMyHashtags.helpers({
    hashtags: function () {
        var hashtags = localStorage.getItem("hashtags").split(",");
        var dataArray = [];
        hashtags.forEach(function (name) {
            dataArray.push({hashtag: name});
        });
        return dataArray;
    }
});