import { Template } from 'meteor/templating';
import { insertInQuestionText } from '/client/plugins/markdown_bar/scripts/lib.js';

Template.vimeoInsertSplash.events({
    "click #js-btn-saveVimeo": function () {
        var linkText = document.getElementById('vimeoText').value;
        var linkDestination = document.getElementById('vimeoDestination').value;
        var videoId = linkDestination.substr(linkDestination.lastIndexOf("/") + 1);
        var picUrl = 'https://i.vimeocdn.com/video/' + videoId + '_200x150.jpg';
        var videoUrl = 'https://player.vimeo.com/video/' + videoId;
        insertInQuestionText('[![' + linkText + '](' + picUrl + ')](' + videoUrl + ')');
        $('#vimeoText').val("");
        $('#vimeoDestination').val("");
        closeSplashscreen();
    },
    "click #js-btn-closeVimeo": function () {
        $('#vimeoText').val("");
        $('#vimeoDestination').val("");
        closeSplashscreen();
    }
});