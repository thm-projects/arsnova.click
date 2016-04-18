/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.
 */

Template.memberlist.onCreated(function () {
    var oldStartTimeValues = {};

    var eventManagerHandle = this.subscribe('EventManager.join', Session.get("hashtag"));
    this.autorun(function () {
        if (eventManagerHandle.ready()) {
            var sessionStatus = EventManager.findOne().sessionStatus;
            if (sessionStatus < 2) {
                if(Session.get("isOwner")) {
                    Router.go("/settimer");
                } else {
                    Router.go("/resetToHome");
                }
            } else if (sessionStatus === 3) {
                Router.go("/results");
            }
        }
    });
    this.subscribe('MemberList.members', Session.get("hashtag"), function () {
        $(window).resize(function () {
            var final_height = $(window).height() - $(".navbar-fixed-top").outerHeight() - $(".navbar-fixed-bottom").outerHeight() - $(".fixed-bottom").outerHeight();
            $(".container").css("height", final_height + "px");
            Session.set("LearnerCountOverride", false);
            calculateButtonCount();
        });

        MemberList.find().observeChanges({
            removed: function (id) {
                let idButton = $('#' + id);
                if(idButton.hasClass("color-changing-own-nick")) {
                    $('.errorMessageSplash').parents('.modal').modal('show');
                    $("#errorMessage-text").html("Du wurdest aus dem Quiz geworfen!");
                    Router.go("/resetToHome");
                } else {
                    idButton.remove();
                }
            },
            added: function () {
                calculateButtonCount();
            }
        });
    });
    this.subscribe('QuestionGroup.memberlist', Session.get("hashtag"), function () {
        var doc = QuestionGroup.findOne();
        for(var i = 0; i< doc.questionList.length; i++) {
            oldStartTimeValues[i] = doc.questionList[i].startTime;
        }
    });
    this.subscribe('Responses.session', Session.get("hashtag"),function () {
        if(Session.get("isOwner")) {
            Meteor.call('Responses.clearAll',localData.getPrivateKey(), Session.get("hashtag"));
        }
    });

    if(Session.get("isOwner")) {
        Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), 0);
        Meteor.call("EventManager.showReadConfirmedForIndex",localData.getPrivateKey(), Session.get("hashtag"), -1);
    }
});

Template.memberlist.onRendered(function () {
    var final_height = $(window).height() - $(".navbar-fixed-top").outerHeight() - $(".navbar-fixed-bottom").outerHeight() - $(".fixed-bottom").outerHeight();
    $(".container").css("height", final_height + "px");
    Session.set("LearnerCountOverride", false);
    calculateButtonCount();

    var calculateFontSize = function() {
        var hashtag_length = Session.get("hashtag").length;
        //take the hastag in the middle of the logo
        var titel_margin_top  = $(".arsnova-logo").height();

        if(hashtag_length <= 10){

            if($(document).width() < 992) {
                $(".hashtag_in_title").css("font-size", "6vw");
            } else {
                $(".hashtag_in_title").css("font-size", "3vw");
            }

            if($(document).width() < 1200){
                $(".header-titel").css("font-size", "6vw");
                $(".header-titel").css("margin-top", titel_margin_top * 0.1);
            } else {
                $(".header-titel").css("font-size", "5vw");
                $(".header-titel").css("margin-top", titel_margin_top * 0.2);
            }

        } else if(hashtag_length > 10 && hashtag_length <= 15){

            if($(document).width() < 992) {
                $(".hashtag_in_title").css("font-size", "6vw");
            } else {
                $(".hashtag_in_title").css("font-size", "3vw");
            }

            $(".header-titel").css("font-size", "4vw");
            $(".header-titel").css("margin-top", titel_margin_top * 0.4);

        } else {

            if($(document).width() < 992) {
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

Template.memberlist.events({
    "click .btn-more-learners": function () {
        Session.set("LearnerCount", MemberList.find().count());
        Session.set("LearnerCountOverride", true);
    },
    'click .btn-less-learners': function () {
        Session.set("LearnerCountOverride", false);
        calculateButtonCount();
    },
    'click .btn-learner': function (event) {
        event.preventDefault();
        if( !Session.get("isOwner") ) {
            return;
        }
        Session.set("nickToBeKicked",{
            nick_name: $(event.currentTarget).text().replace(/(?:\r\n|\r| |\n)/g, ''),
            nick_id: $(event.currentTarget).attr("id")
        });
        $('.js-splashscreen-noLazyClose').modal("show");
    },
    'click #kickMemberButton': function () {
        Meteor.call('MemberList.removeLearner',localData.getPrivateKey(),Session.get("hashtag"),Session.get("nickToBeKicked").nick_id,function (err) {
            $('.js-splashscreen-noLazyClose').modal("hide");
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
            }
        });
    },
    'click #closeDialogButton': function () {
        closeSplashscreen();
    },
    'click #startPolling': function () {
        Session.set("sessionClosed", false);
        Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), -1);
        Meteor.call('EventManager.setSessionStatus', localData.getPrivateKey(), Session.get("hashtag"), 3);
    },
    'click #backButton':function(){
        Meteor.call("MemberList.removeFromSession", localData.getPrivateKey(), Session.get("hashtag"));
        Meteor.call("EventManager.setActiveQuestion",localData.getPrivateKey(), Session.get("hashtag"), 0);
        Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), Session.get("hashtag"), 1);
        Router.go("/settimer");
    }
});

Template.memberlist.helpers({
    hashtag: function () {
        return Session.get("hashtag");
    },
    isOwner: function () {
        return Session.get("isOwner");
    },
    isLearnerCountOverride: function () {
        return Session.get('LearnerCountOverride');
    },
    learners: function () {
        var sortParamObj = Session.get('LearnerCountOverride') ? {lowerCaseNick: 1} : {insertDate: -1};
        return [
            MemberList.find({nick:Session.get("nick")}, {
                limit: 1
            }),
            MemberList.find({nick: {$ne: Session.get("nick")}}, {
                limit: (Session.get("LearnerCount") - 1),
                sort: sortParamObj
            })
        ];
    },
    showMoreButton: function () {
        return ((MemberList.find().count() - Session.get("LearnerCount")) > 1);
    },

    invisibleLearnerCount: function () {
        return MemberList.find().count() - Session.get("LearnerCount");
    }
});

Template.kickMemberConfirmation.helpers({
    kicked_nick_name: function () {
        return Session.get("nickToBeKicked") ? Session.get("nickToBeKicked").nick_name : "";
    }
});

Template.learner.onRendered(function () {
    calculateButtonCount();
});

Template.learner.helpers({
    isOwnNick: function (nickname) {
        return nickname === Session.get("nick");
    }
});

function calculateButtonCount () {

    /*
    This session variable determines if the user has clicked on the show-more-button. The button count must not
    be calculated then. It is set in the event handler of the button and is reset if the user reenters the page
     */
    if (Session.get("LearnerCountOverride")) {
        return;
    }

    /*
    To calculate the maximum output of attendee button rows we need to:
    - get the contentPosition height (the content wrapper for all elements)
    - subtract the confirmationCounter height (the progress bar)
    - subtract the attendee-in-quiz-wrapper height (the session information for the attendees)
    - subtract the margin to the top (the title or the show more button)
     */
    var viewport = $(".contentPosition"),
        attendeeInQuiz = $('#attendee-in-quiz-wrapper').length > 0 ? $('#attendee-in-quiz-wrapper').outerHeight() : 0,
        learnerListMargin = $('.learner-list').length > 0 ? parseInt($('.learner-list').first().css('margin-top').replace("px", "")) : 0;

    var viewPortHeight =
        viewport.outerHeight() -
        attendeeInQuiz -
        learnerListMargin;

    /* The height of the learner button must be set manually if the html elements are not yet generated */
    var btnLearnerHeight = $('.btn-learner').first().parent().outerHeight() ? $('.btn-learner').first().parent().outerHeight() : 54;

    /* Calculate how much buttons we can place in the viewport until we need to scroll */
    var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);

    /*
    Multiply the displayed elements by 3 if on widescreen and reduce the max output of buttons by 1 row for the display
    more button if necessary. Also make sure there is at least one row of buttons shown even if the user has to scroll
    */
    var allMembers = MemberList.find().count();
    var limitModifier = (viewport.outerWidth() >= 992) ? 3 : (viewport.outerWidth() >= 768 && viewport.outerWidth() < 992) ? 2 : 1;

    queryLimiter *= limitModifier;
    if (queryLimiter <= 0){
        queryLimiter = limitModifier;
    } else if(allMembers > queryLimiter) {

        /*
        Use Math.ceil() as a session owner because the member buttons position may conflict with the back/forward buttons position.
        As a session attendee we do not have these buttons, so we can use Math.floor() to display a extra row
         */
        if($(".fixed-bottom").length > 0) {
            queryLimiter -= Math.ceil($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
        } else {
            queryLimiter -= Math.floor($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
        }
    }

    /*
    This session variable holds the amount of shown buttons and is used in the helper function
    Template.memberlist.helpers.learners which gets the attendees from the mongo db
     */
    Session.set("LearnerCount", queryLimiter);
}
