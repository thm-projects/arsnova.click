import {calculateButtonCount} from './lib.js';

Template.memberlist.onRendered(function () {
    var final_height = $(window).height() - $(".navbar-fixed-top").outerHeight() - $(".navbar-fixed-bottom").outerHeight() - $(".fixed-bottom").outerHeight();
    $(".container").css("height", final_height + "px");
    Session.set("LearnerCountOverride", false);
    calculateButtonCount();

    var calculateFontSize = function () {
        var hashtag_length = Session.get("hashtag").length;
        //take the hastag in the middle of the logo
        var titel_margin_top = $(".arsnova-logo").height();

        if (hashtag_length <= 10) {

            if ($(document).width() < 992) {
                $(".hashtag_in_title").css("font-size", "6vw");
            } else {
                $(".hashtag_in_title").css("font-size", "3vw");
            }

            if ($(document).width() < 1200) {
                $(".header-titel").css("font-size", "6vw");
                $(".header-titel").css("margin-top", titel_margin_top * 0.1);
            } else {
                $(".header-titel").css("font-size", "5vw");
                $(".header-titel").css("margin-top", titel_margin_top * 0.2);
            }

        } else if (hashtag_length > 10 && hashtag_length <= 15) {

            if ($(document).width() < 992) {
                $(".hashtag_in_title").css("font-size", "6vw");
            } else {
                $(".hashtag_in_title").css("font-size", "3vw");
            }

            $(".header-titel").css("font-size", "4vw");
            $(".header-titel").css("margin-top", titel_margin_top * 0.4);

        } else {

            if ($(document).width() < 992) {
                $(".hashtag_in_title").css("font-size", "4vw");
            } else {
                $(".hashtag_in_title").css("font-size", "2vw");
            }

            $(".header-titel").css("font-size", "2.5vw");
            $(".header-titel").css("margin-top", titel_margin_top * 0.6);
        }
    }();
    $(window).resize(calculateFontSize);
});

Template.learner.onRendered(function () {
    calculateButtonCount();
});