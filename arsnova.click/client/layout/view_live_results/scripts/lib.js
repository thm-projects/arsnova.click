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
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { TAPi18n } from 'meteor/tap:i18n';
import { EventManager } from '/lib/eventmanager.js';
import { AnswerOptions } from '/lib/answeroptions.js';
import { MemberList } from '/lib/memberlist.js';
import { QuestionGroup } from '/lib/questions.js';
import * as localData from '/client/lib/local_storage.js';
import { mathjaxMarkdown } from '/client/lib/mathjax_markdown.js';
import { splashscreenError, Splashscreen } from '/client/plugins/splashscreen/scripts/lib.js';
import { buzzsound1 } from '/client/plugins/sound/scripts/lib.js';

export let countdown = null;
export let routeToLeaderboardTimer = null;
export let eventManagerObserver = null;
export let readingConfirmationTracker = null;

export function deleteCountdown () {
    countdown = null;
}

export function setEventManagerObserver (observer) {
    eventManagerObserver = observer;
}

/**
 * @source http://stackoverflow.com/a/17267684
 */
export function hsl_col_perc (percent, start, end) {
    var a = percent / 100, b = end * a, c = b + start;
    return 'hsl(' + c + ',100%,25%)';
}

export function getPercentRead (index) {
    var sumRead = 0;
    var count = 0;
    MemberList.find().map(function (member) {
        count++;
        if (member.readConfirmed[index]) {
            sumRead += member.readConfirmed[index];
        }
    });
    return count ? Math.floor(sumRead / count * 100) : 0;
}

export function getCurrentRead (index) {
    var sumRead = 0;
    MemberList.find().map(function (member) {
        if (member.readConfirmed[index]) {
            sumRead += member.readConfirmed[index];
        }
    });
    return sumRead;
}

export function checkIfIsCorrect (isCorrect) {
    return isCorrect > 0 ? 'progress-success' : isCorrect < 0 ? 'progress-default' : 'progress-failure';
}

export function startCountdown (index) {
    Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), index);
    var questionDoc = QuestionGroup.findOne().questionList[index];
    Session.set("sessionCountDown", questionDoc.timer);
    $("#countdowndiv").appendTo($("body"));
    $("#countdown").appendTo($("body"));
    var f = new buzz.sound('/sounds/trillerpfeife.mp3', {
        volume: 50
    });
    countdown = new ReactiveCountdown(questionDoc.timer / 1000, {

        tick: function () {
            if (countdown.get() > 5) {
                return;
            }

            var image = document.getElementById('countdown');
            var image1 = $('.fader');
            var imageDiv = document.getElementById('countdowndiv');

            if (image.src.match(/gr5/g)) {
                image.src = "/images/gruen.gif";
                image1.fadeIn(500);
                imageDiv.style.display = "block";
                image.style.display = "block";
                image1.fadeOut(500);
            } else if (image.src.match(/gruen/g)) {
                imageDiv.style.backgroundColor = "#2f4f4f";
                image.src = "/images/blau.gif";
                image1.fadeIn(500);
                image1.fadeOut(500);
            } else if (image.src.match(/blau/g)) {
                imageDiv.style.backgroundColor = "#663399";
                image.src = "/images/lila3.gif";
                image1.fadeIn(500);
                image1.fadeOut(500);
            } else if (image.src.match(/lila3/g)) {
                imageDiv.style.backgroundColor = "#b22222";
                image.src = "/images/rot2.gif";
                image1.fadeIn(500);
                image1.fadeOut(500);
            } else if (image.src.match(/rot2/g)) {
                imageDiv.style.backgroundColor = "#ff8c00";
                image.src = "/images/orange1.gif";
                image1.fadeIn(500);
                image1.fadeOut(500);
            } else if (image.src.match(/orange1/g)) {
                imageDiv.style.backgroundColor = "#ffd700";
                image.src = "/images/gelb0.gif";
                image1.fadeIn(500);
                image1.fadeOut(500);
                if (Session.get("togglemusic")) {
                    f.play();
                }
            }
        }
    });

    buzzsound1.setVolume(Session.get("globalVolume"));
    if (Session.get("togglemusic")) {
        buzzsound1.play();
    }

    countdown.start(function () {
        buzzsound1.stop();
        Session.set("countdownInitialized", false);
        $('.disableOnActiveCountdown').removeAttr("disabled");
        if (index + 1 >= QuestionGroup.findOne().questionList.length) {
            Session.set("sessionClosed", true);
            if (Session.get("isOwner") && AnswerOptions.find({isCorrect: 1}).count() > 0) {
                routeToLeaderboardTimer = setTimeout(() => {
                    Router.go("/statistics");
                }, 7000);
            }
        }
    });
    Session.set("countdownInitialized", true);
    $('.disableOnActiveCountdown').attr("disabled", "disabled");
}

export function startReadingConfirmationTracker () {
    readingConfirmationTracker = Tracker.autorun(()=> {
        if (EventManager.findOne()) {
            EventManager.find().observeChanges({
                changed: function (id, changedFields) {
                    if (!isNaN(changedFields.readingConfirmationIndex)) {
                        new Splashscreen({
                            autostart: true,
                            templateName: 'readingConfirmedSplashscreen',
                            closeOnButton: '#setReadConfirmed',
                            onRendered: function (instance) {
                                var questionDoc = QuestionGroup.findOne();
                                var content = "";
                                if (questionDoc) {
                                    mathjaxMarkdown.initializeMarkdownAndLatex();
                                    var questionText = questionDoc.questionList[EventManager.findOne().readingConfirmationIndex].questionText;
                                    content = mathjaxMarkdown.getContent(questionText);
                                }
                                instance.templateSelector.find('#questionContent').html(content);

                                if ( Session.get("isOwner") ) {
                                    instance.templateSelector.find('#setReadConfirmed').text(TAPi18n.__("global.close_window"));
                                } else {
                                    instance.templateSelector.find('#setReadConfirmed').parent().on('click', '#setReadConfirmed', function () {
                                        Meteor.call("MemberList.setReadConfirmed", {
                                            hashtag: Session.get("hashtag"),
                                            questionIndex: EventManager.findOne().readingConfirmationIndex,
                                            nick: Session.get("nick")
                                        }, (err)=> {
                                            if (err) {
                                                splashscreenError.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages."+err.reason));
                                                splashscreenError.open();
                                            }
                                        });
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    });
}

/**
 * TODO remove this function with the Meteor 1.3 update and replace with an import from the memberList!
 */
export function calculateButtonCount () {

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
    var viewport = $(".contentPosition"), learnerListMargin = $('.learner-list').length > 0 ? parseInt($('.learner-list').first().css('margin-top').replace("px", "")) : 0;

    var viewPortHeight = viewport.outerHeight() - $('.question-title').outerHeight(true) - $('.readingConfirmationProgressRow').outerHeight(true) - $('.btn-more-learners').outerHeight(true) - learnerListMargin;

    /* The height of the learner button must be set manually if the html elements are not yet generated */
    var btnLearnerHeight = $('.btn-learner').first().parent().outerHeight() ? $('.btn-learner').first().parent().outerHeight() : 54;

    /* Calculate how much buttons we can place in the viewport until we need to scroll */
    var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);

    /*
     Multiply the displayed elements by 3 if on widescreen and reduce the max output of buttons by 1 row for the display
     more button if necessary. Also make sure there is at least one row of buttons shown even if the user has to scroll
     */
    var allMembers = [];
    MemberList.find().forEach(function (doc) {
        if (doc.readConfirmed[EventManager.findOne().readingConfirmationIndex]) {
            allMembers.push(doc);
        }
    });
    var limitModifier = (viewport.outerWidth() >= 992) ? 3 : (viewport.outerWidth() >= 768 && viewport.outerWidth() < 992) ? 2 : 1;

    queryLimiter *= limitModifier;
    if (queryLimiter <= 0) {
        queryLimiter = limitModifier;
    } else if (allMembers > queryLimiter) {

        /*
         Use Math.ceil() as a session owner because the member buttons position may conflict with the back/forward buttons position.
         As a session attendee we do not have these buttons, so we can use Math.floor() to display a extra row
         */
        if ($(".fixed-bottom").length > 0) {
            queryLimiter -= Math.ceil($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
        } else {
            queryLimiter -= Math.floor($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
        }
    }

    /*
     This session variable holds the amount of shown buttons and is used in the scripts function
     Template.memberlist.scripts.learners which gets the attendees from the mongo db
     */
    Session.set("LearnerCount", queryLimiter);
}