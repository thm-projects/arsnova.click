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
    this.autorun(() => {
        this.subscription = Meteor.subscribe('Responses.session', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('AnswerOptions.options', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('MemberList.members', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('Sessions.question', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('LeaderBoard.session', Session.get("hashtag"));
    });
});

Template.endOfPollingSplashscreen.rendered = function () {
    var splashscreen = $('.js-splashscreen-end-of-polling');
    splashscreen.modal({
        backdrop: 'static',
        keyboard: false,
        show: false
    });
};

Template.endOfPollingSplashscreen.events({
    "click #js-btn-hideEndOfPollingModal": function () {
        $('.js-splashscreen-end-of-polling')
            .on('hidden.bs.modal', function() {
                Router.go('/results');
            })
            .modal('hide');
    }
});

Template.endOfPollingSplashscreen.helpers({
    isSurvey: function(){
        var correctAnswerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        return correctAnswerOptions === 0;
    },

    isSC: function(){
        var correctAnswerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        return correctAnswerOptions === 1;
    },

    isMC:function(){
        var correctAnswerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        return correctAnswerOptions > 1;
    },

    correct: function() {
        const correctAnswers = [];

        AnswerOptions.find({
            hashtag: Session.get("hashtag"),
            isCorrect: 1
        }, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
            correctAnswers.push(answer.answerOptionNumber);
        });
        MemberList.findOne({hashtag: Session.get("hashtag"), nick: Session.get("nick")});

        var responseAmount = 0;
        var everythingRight = true;

        Responses.find({hashtag: Session.get("hashtag"), userNick: Session.get("nick")}).forEach(function (response) {
            if (!($.inArray(response.answerOptionNumber, correctAnswers) !== -1)) {
                everythingRight = false;
            }
            responseAmount++;
        });
        if (responseAmount) {
            if (everythingRight && responseAmount === correctAnswers.length) {
                return true;
            }
        }
        return false;
    },
    allAnswersFalse: function () {
        const wrongAnswers = [];

        AnswerOptions.find({
            hashtag: Session.get("hashtag"),
            isCorrect: 0
        }, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
            wrongAnswers.push(answer.answerOptionNumber);
        });
        MemberList.findOne({hashtag: Session.get("hashtag"), nick: Session.get("nick")});

        var responseAmount = 0;
        var everythingFalse = true;

        Responses.find({hashtag: Session.get("hashtag"), userNick: Session.get("nick")}).forEach(function (response) {
            if (!($.inArray(response.answerOptionNumber, wrongAnswers) !== -1)) {
                everythingFalse = false;
            }
            responseAmount++;
        });
        if (responseAmount) {
            if (everythingFalse && responseAmount === wrongAnswers.length) {
                return true;
            }
        }
        return false;
    },
    getActPosition: function () {
        var startPosition = 1;
        var myResponseMillis = Responses.findOne({hashtag: Session.get("hashtag"), userNick: Session.get("nick")}).responseTime;

        LeaderBoard.find({hashtag: Session.get("hashtag")}).forEach(function (leaderBoardEntry) {
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
        var myResponseMillis = Responses.findOne({hashtag: Session.get("hashtag"), userNick: Session.get("nick")}).responseTime;

        LeaderBoard.find({hashtag: Session.get("hashtag")}).forEach(function (leaderBoardEntry) {
            if (leaderBoardEntry.userNick != Session.get("nick") && leaderBoardEntry.givenAnswers == leaderBoardEntry.rightAnswers){
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

        if (!currentMemberBehind && !currentMemberInFront){
            return String.empty();
        }else{
            if(!currentMemberBehind){
                return "Du bist hinter " + currentMemberInFront.userNick + ".";
            }else{
                if(!currentMemberInFront) {
                    return "Du bist vor " + currentMemberBehind.userNick + ".";
                }
                else{
                    return "Du bist vor " + currentMemberBehind.userNick + " und hinter " + currentMemberInFront.userNick + ".";
                }
            }
        }
    }
});