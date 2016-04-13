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

var countdown = null;
Template.votingview.onCreated(function () {
    Session.set("sessionClosed", undefined);
    countdown = null;

    this.autorun(() => {
        this.subscribe("EventManager.join",Session.get("hashtag"));
        this.subscribe('AnswerOptions.public', Session.get("hashtag"), function () {
            var answerOptionCount = AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}).count();
            var responseArr = [];
            for (var i = 0; i <answerOptionCount; i++) {
                responseArr[i] = false;
            }
            Session.set("responses", JSON.stringify(responseArr));
        });
        this.subscribe('QuestionGroup.questionList', Session.get("hashtag"), function () {
            Session.set("questionGroupSubscriptionReady", true);
        });
        if(Session.get("questionGroupSubscriptionReady") && !Session.get("sessionClosed")) {
            startCountdown(EventManager.findOne().questionIndex);
        }
    });
});

Template.votingview.onDestroyed(function () {
    Session.set("questionSC", undefined);
    Session.set("responses", undefined);
    Session.set("countdownInitialized", undefined);
    Session.set("hasToggledResponse", undefined);
    Session.set("hasSendResponse", undefined);
    if(countdown) countdown.stop();
});

Template.votingview.onRendered(function () {
    $(window).resize(function () {
        formatAnswerButtons();
    });
    formatAnswerButtons();
});

Template.votingview.helpers({
    answerOptions: function () {
        return AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort:{answerOptionNumber: 1}});
    },
    showForwardButton: function () {
        return Session.get("hasToggledResponse") && !(Session.get("hasSendResponse"));
    },
    answerOptionLetter: function (number) {
        return String.fromCharCode((number.hash.number + 65));
    },
    getCountdown: function () {
        if (Session.get("countdownInitialized")) {
            if(countdown.get() === 1) {
                return "Noch 1 Sekunde!";
            }
            return "Noch " + countdown.get() + " Sekunden!";
        }
    }
});

Template.votingview.events({
    "click #js-btn-showQuestionModal": function (event) {
        event.stopPropagation();
        $('.questionContentSplash').parents('.modal').modal();
        var questionDoc = QuestionGroup.findOne();
        var content = "";
        if (questionDoc) {
            mathjaxMarkdown.initializeMarkdownAndLatex();
            var questionText = questionDoc.questionList[EventManager.findOne().questionIndex].questionText;
            content = mathjaxMarkdown.getContent(questionText);
        }

        $('#questionText').html(content);
    },
    "click #js-showAnswerTexts": function (event) {
        event.stopPropagation();
        mathjaxMarkdown.initializeMarkdownAndLatex();
        $('.answerTextSplash').parents('.modal').modal();
        var content = "";

        AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort:{answerOptionNumber: 1}}).forEach(function (answerOption) {
            content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
            content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
        });

        $('#answerOptionsTxt').html(content);
    },
    "click #forwardButton": function (event) {
        event.stopPropagation();
        if(Session.get("hasSendResponse")) return;

        Session.set("hasSendResponse", true);
        var responseArr = JSON.parse(Session.get("responses"));
        for (var i = 0; i < AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}).count(); i++ ) {
            if (responseArr[i]) {
                makeAndSendResponse(i);
            }
        }
        if(EventManager.findOne().questionIndex + 1 >= QuestionGroup.findOne().questionList.length) {
            Session.set("sessionClosed", true);
        }
        Router.go("/results");
    },
    "click .sendResponse": function (event) {
        event.stopPropagation();
        if(Session.get("hasSendResponse")) return;

        if (Session.get("questionSC")) {
            makeAndSendResponse(event.currentTarget.id);
            Session.set("hasToggledResponse", true);
        }
        else {
            var responseArr = JSON.parse(Session.get("responses"));
            var currentId = event.currentTarget.id;
            responseArr[currentId] = responseArr[currentId] ? false : true;
            var hasToggledResponse = false;
            responseArr.forEach(function (number) {
                if (number) {
                    hasToggledResponse = true;
                }
            });
            Session.set("hasToggledResponse", hasToggledResponse);
            Session.set("responses", JSON.stringify(responseArr));
            $(event.target).toggleClass("answer-selected");
        }
    }
    // submit button onclick -> feedback splashscreen + redirect
});

function startCountdown(index) {
    Session.set("hasSendResponse", false);
    Session.set("hasToggledResponse", false);

    Meteor.call('Question.isSC', {
        hashtag: Session.get("hashtag"),
        questionIndex: EventManager.findOne().questionIndex
    }, (err, res) => {
        if (!err && res) {
            Session.set("questionSC", res);
        }
    });

    var questionDoc = QuestionGroup.findOne().questionList[index];
    Session.set("sessionCountDown", questionDoc.timer);
    countdown = new ReactiveCountdown(questionDoc.timer / 1000);
    countdown.start(function () {
        if(index + 1 >= QuestionGroup.findOne().questionList.length) {
            Session.set("sessionClosed", true);
        }
        Router.go("/results");
    });
    Session.set("countdownInitialized", true);
}

function makeAndSendResponse(answerOptionNumber) {
    Meteor.call('Responses.addResponse', {
        hashtag: Session.get("hashtag"),
        questionIndex: EventManager.findOne().questionIndex,
        answerOptionNumber: Number(answerOptionNumber),
        userNick: Session.get("nick")
    }, (err, res) => {
        if (err) {
            console.log({
                hashtag: Session.get("hashtag"),
                questionIndex: EventManager.findOne().questionIndex,
                answerOptionNumber: Number(answerOptionNumber),
                userNick: Session.get("nick")
            },err);
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html(err.reason);
        }
    });
}

function calculateAnswerRowHeight () {
    return $(window).height() - $('.header-title').height() - $('#appTitle').height() - $('.voting-helper-buttons').height() - $('.navbar-fixed-bottom').height() - 15;
}

function formatAnswerButtons () {
    var answerRow = $('.answer-row');
    var answerButtonContainerHeight = calculateAnswerRowHeight();
    answerRow.css('height', answerButtonContainerHeight + 'px');

    var answerOptionsCount = answerRow.children().length;
    if (answerOptionsCount == 0) {
        setTimeout(function () {
            formatAnswerButtons();
        }, 100);
        return;
    }

    var buttonHeight = 0;
    answerRow.children().removeClass('col-xs-12').removeClass('col-xs-6').removeClass('col-xs-4');

    if (answerOptionsCount <= 3) {
        answerButtonContainerHeight -= answerOptionsCount * 30;
        answerRow.children().addClass('col-xs-12');
        buttonHeight = answerButtonContainerHeight / answerOptionsCount;
    } else if (answerOptionsCount <= 6) {
        answerButtonContainerHeight -= Math.ceil((answerOptionsCount / 2)) * 30;
        answerRow.children().addClass('col-xs-6');
        buttonHeight = answerButtonContainerHeight / (Math.ceil(answerOptionsCount / 2));
    } else {
        answerButtonContainerHeight -= Math.ceil((answerOptionsCount / 3)) * 30;
        answerRow.children().addClass('col-xs-4');
        buttonHeight = answerButtonContainerHeight / (Math.ceil(answerOptionsCount / 3));
    }

    answerRow.find('button').css('height', buttonHeight + 'px');
}