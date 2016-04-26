import { Template } from 'meteor/templating';

Template.nick.onRendered(function () {
    $("#forwardButton").attr("disabled", "disabled");

    if ($(window).width() >= 992) {
        $('#nickname-input-field').focus();
    }
});