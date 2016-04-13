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

Template.leaderBoard.onCreated(function () {
    this.subscribe('Responses.session', Session.get("hashtag"));
    this.subscribe('AnswerOptions.options', Session.get("hashtag"));
    this.subscribe('MemberList.members', Session.get("hashtag"));
    this.subscribe('QuestionGroup.questionList', Session.get("hashtag"));
    this.subscribe("EventManager.join",Session.get("hashtag"));

    Session.set('show_all_leaderboard', false);
});

Template.leaderBoard.events({
    'click #showMore': ()=> {
        Session.set('show_all_leaderboard', true);
    },
    'click #showLess': ()=> {
        Session.set('show_all_leaderboard', false);
    },
    'click #js-btn-backToResults': ()=> {
        Router.go('/results');
    }
});

Template.leaderBoard.helpers({
    hashtag: ()=> {
        return Session.get("hashtag");
    },
    getTitleText: ()=>{
        if(typeof Session.get("showLeaderBoardId") !== "undefined") {
            return "Quizfrage " + (Session.get("showLeaderBoardId") + 1) + ": Alles richtig haben...";
        } else {
            return "Alles richtig haben...";
        }
    },
    getPosition: function (index) {
        return (index + 1);
    },
    parseTimeToSeconds: function (milliseconds) {
        return Math.round((milliseconds / 10), 2) / 100;
    },
    showAllLeaderboard: ()=>{
        return Session.get('show_all_leaderboard');
    },
    leaderBoardItems: ()=> {
        var allGoodMembers = [];
        var param = {isCorrect: 1};
        if(typeof Session.get("showLeaderBoardId") !== "undefined") {
            param.questionIndex = Session.get("showLeaderBoardId");
        }
        var rightAnswerOptions = AnswerOptions.find(param);
        delete param.isCorrect;

        MemberList.find({}, {fields: {nick: 1}}).forEach(function (member) {
            param.userNick = member.nick;
            var userResponses = Responses.find(param);
            delete param.userNick;
            var userHasRightAnswers = true;
            // only put member in leaderboard when he clicked the right amount, then check whether he clicked all the right ones
            var totalResponseTime = 0;
            if ((userResponses.count() === rightAnswerOptions.count()) && (userResponses.count() > 0) && userHasRightAnswers ) {
                userResponses.forEach(function (userResponse) {
                    param.isCorrect = 1;
                    param.answerOptionNumber = userResponse.answerOptionNumber;
                    var checkAnswerOptionDoc = AnswerOptions.findOne(param);
                    delete param.isCorrect;
                    delete param.answerOptionNumber;
                    if (!checkAnswerOptionDoc) {
                        userHasRightAnswers = false;
                    }
                    else {
                        totalResponseTime += userResponse.responseTime;
                    }
                });
                if (userHasRightAnswers) {
                    allGoodMembers.push({
                        nick: member.nick,
                        responseTime: totalResponseTime / rightAnswerOptions.count()
                    });
                }
            }
        });

        //check if the show all button was pressed
        if (Session.get('show_all_leaderboard')) {
            return _.sortBy(allGoodMembers, 'responseTime');
        } else {
            return _.sortBy(allGoodMembers, 'responseTime').slice(0, 6);
        }
    }
});