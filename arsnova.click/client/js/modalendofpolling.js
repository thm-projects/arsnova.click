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

Template.endOfPollingSplashscreen.onCreated(function () {
    this.subscribe('Responses.session', Session.get("hashtag"));
    this.subscribe('AnswerOptions.options', Session.get("hashtag"));
    this.subscribe('MemberList.members', Session.get("hashtag"));
    this.subscribe('QuestionGroup.question', Session.get("hashtag"));
    this.subscribe('LeaderBoard.session', Session.get("hashtag"));
    this.subscribe("EventManager.join",Session.get("hashtag"));
});

Template.endOfPollingSplashscreen.onRendered(function () {
    var splashscreen = $('.js-splashscreen-end-of-polling');
    splashscreen.modal({
        backdrop: 'static',
        keyboard: false,
        show: false
    });
});

Template.endOfPollingSplashscreen.events({
    "click #js-btn-hideEndOfPollingModal": function (event) {
        event.stopPropagation(); //Prevent Uncaught Error: Must be attached, @see https://github.com/meteor/meteor/issues/2981#issuecomment-132072395

        $('.js-splashscreen-end-of-polling')
            .on('hidden.bs.modal', function() {
                Router.go('/results');
            })
            .modal('hide');
    }
});

Template.endOfPollingSplashscreen.helpers({
    isSurvey: function(){
        return AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex, isCorrect: 1}).count() === 0;
    },

    isSC: function(){
        return AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex, isCorrect: 1}).count() === 1;
    },

    isMC:function(){
        return AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex, isCorrect: 1}).count() > 1;
    },

    correct: function() {
        const correctAnswers = [];

        AnswerOptions.find({
            questionIndex: EventManager.findOne().questionIndex,
            isCorrect: 1
        }, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
            correctAnswers.push(answer.answerOptionNumber);
        });
        MemberList.findOne({nick: Session.get("nick")});

        var responseAmount = 0;
        var everythingRight = true;

        Responses.find({userNick: Session.get("nick")}).forEach(function (response) {
            if (!($.inArray(response.answerOptionNumber, correctAnswers) !== -1)) {
                everythingRight = false;
            }
            responseAmount++;
        });

        return responseAmount && everythingRight && responseAmount === correctAnswers.length;
    },
    allAnswersFalse: function () {
        const wrongAnswers = [];

        AnswerOptions.find({
            questionIndex: EventManager.findOne().questionIndex,
            isCorrect: 0
        }, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
            wrongAnswers.push(answer.answerOptionNumber);
        });
        MemberList.findOne({nick: Session.get("nick")});

        var responseAmount = 0;
        var everythingFalse = true;

        Responses.find({userNick: Session.get("nick")}).forEach(function (response) {
            if (!($.inArray(response.answerOptionNumber, wrongAnswers) !== -1)) {
                everythingFalse = false;
            }
            responseAmount++;
        });

        return responseAmount && everythingFalse && responseAmount === wrongAnswers.length;
    },
    getActPosition: function () {
        var startPosition = 1;
        var myResponseMillis = Responses.findOne({userNick: Session.get("nick")}).responseTime;

        LeaderBoard.find().forEach(function (leaderBoardEntry) {
            if (leaderBoardEntry.userNick != Session.get("nick")
                && leaderBoardEntry.givenAnswers == leaderBoardEntry.rightAnswers
                && leaderBoardEntry.responseTimeMillis < myResponseMillis) {
                startPosition++;
            }
        });

        return startPosition;
    },
    getTextPositionContext: function () {
        var currentMemberBehind;
        var currentMemberInFront;
        var myResponseMillis = Responses.findOne({userNick: Session.get("nick")}).responseTime;

        LeaderBoard.find().forEach(function (leaderBoardEntry) {
            if (leaderBoardEntry.userNick !== Session.get("nick") && leaderBoardEntry.givenAnswers === leaderBoardEntry.rightAnswers){
                if (leaderBoardEntry.responseTimeMillis >= myResponseMillis){
                    if (!currentMemberBehind || leaderBoardEntry.responseTimeMillis < currentMemberBehind.responseTimeMillis){
                        currentMemberBehind = leaderBoardEntry;
                    }
                }else{
                    if (!currentMemberInFront || leaderBoardEntry.responseTimeMillis >= currentMemberInFront.responseTimeMillis){
                        currentMemberInFront = leaderBoardEntry;
                    }
                }
            }
        });

        return !currentMemberBehind && !currentMemberInFront ? String.empty()
            : !currentMemberBehind ? "Du bist hinter " + currentMemberInFront.userNick + "."
            : !currentMemberInFront ? "Du bist vor " + currentMemberBehind.userNick + "."
            : "Du bist vor " + currentMemberBehind.userNick + " und hinter " + currentMemberInFront.userNick + ".";
    }
});