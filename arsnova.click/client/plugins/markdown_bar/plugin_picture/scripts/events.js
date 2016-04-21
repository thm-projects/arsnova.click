import {insertInQuestionText} from './../../scripts/lib.js';

Template.pictureInsertSplash.events({
    "click #js-btn-savePicture": function () {
        var linkText = document.getElementById('pictureText').value;
        var linkDestination = document.getElementById('pictureDestination').value;
        insertInQuestionText('![' + linkText + '](' + linkDestination + ' "autoxautoxleft")');
        $('#pictureText').val("");
        $('#pictureDestination').val("");
        closeSplashscreen();
    },
    "click #js-btn-closePicture": function () {
        $('#pictureText').val("");
        $('#pictureDestination').val("");
        closeSplashscreen();
    }
});