import { Template } from 'meteor/templating';

Template.hashtag_view.onRendered(function () {
    if ($(window).width() >= 992) {
        $('#hashtag-input-field').focus();
    }
});