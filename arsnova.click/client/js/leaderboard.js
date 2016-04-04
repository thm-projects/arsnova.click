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

Template.leaderBoard.onCreated( function () {
    this.autorun(() => {
        this.subscription = Meteor.subscribe('Responses.session', Session.get("hashtag"), function () {
            Session.set("responsesLoaded", true);
        });
        this.subscription = Meteor.subscribe('AnswerOptions.options', Session.get("hashtag"), function () {
            Session.set("answerOptionsLoaded", true);
        });
        this.subscription = Meteor.subscribe('MemberList.members', Session.get("hashtag"), function () {
            Session.set("memberListLoaded", true);
        });
    });

    Session.set('show_all_leaderboard', false);
});

Template.leaderBoard.events({
    'click #showMore': function () {
        Session.set('show_all_leaderboard', true);
        $('#showLess').closest('div.col-xs-6').toggleClass('hidden');
        $('#showMore').closest('div.col-xs-6').toggleClass('hidden');
    },
    'click #showLess': function () {
        Session.set('show_all_leaderboard', false);
        $('#showLess').closest('div.col-xs-6').toggleClass('hidden');
        $('#showMore').closest('div.col-xs-6').toggleClass('hidden');
    },
    'click #js-btn-backToResults': function () {
        Router.go('/results');
    }
});

Template.leaderBoard.helpers({
    hashtag: function () {
        return Session.get("hashtag");
    },
    getPosition: function (index) {
        return (index + 1);
    },
    parseTimeToSeconds: function (milliseconds) {
        return Math.round((milliseconds / 10), 2) / 100;
    },
    leaderBoardItems: function () {
        var leaderBoardItems = [];
        var allGoodMembers = [];
        var rightAnswerOptions = AnswerOptions.find({isCorrect: 1});
        var memberNicks = MemberList.find({}, {fields: {nick: 1}});
        memberNicks.forEach(function (member) {
            var entry = {
                nick: member.nick,
                responseTime: 0
            };
            var userResponses = Responses.find({userNick: member.nick});
            var userHasRightAnswers = true;
            // only put member in leaderboard when he clicked the right amount, then check whether he clicked all the right ones
            var totalResponseTime = 0;
            if ((userResponses.count() === rightAnswerOptions.count()) && (userResponses.count() > 0) && userHasRightAnswers ) {
                userResponses.forEach(function (userResponse) {
                    var checkAnswerOptionDoc = AnswerOptions.findOne({isCorrect: 1, answerOptionNumber: userResponse.answerOptionNumber});
                    if (!checkAnswerOptionDoc) {
                        userHasRightAnswers = false;
                    }
                    else {
                        totalResponseTime += userResponse.responseTime;
                    }
                });
                if (userHasRightAnswers) {
                    entry.responseTime = totalResponseTime / rightAnswerOptions.count();
                    allGoodMembers.push(entry);
                }
            }
        });

        var sortedArray;
        //check if the show all button was pressed
        if (!Session.get('show_all_leaderboard')) {
            sortedArray = _.sortBy(allGoodMembers, 'responseTime').slice(0, 6);
        } else {
            sortedArray = _.sortBy(allGoodMembers, 'responseTime');
        }

        return sortedArray;
    }
});