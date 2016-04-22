import { Template } from 'meteor/templating';
import { insertInQuestionText } from '/client/plugins/markdown_bar/scripts/lib.js';

Template.youtubeInsertSplash.events({
    "click #js-btn-saveYoutube": function () {
        var linkText = document.getElementById('youtubeText').value;
        var linkDestination = document.getElementById('youtubeDestination').value;
        var picUrl = linkDestination.replace("www.", "img.").replace("watch?v=", "vi/").concat("/0.jpg");
        insertInQuestionText('[![' + linkText + '](' + picUrl + ')](' + linkDestination + ')');
        $('#youtubeText').val("");
        $('#youtubeDestination').val("");
        closeSplashscreen();
    },
    "click #js-btn-closeYoutube": function () {
        $('#youtubeText').val("");
        $('#youtubeDestination').val("");
        closeSplashscreen();
    }
});