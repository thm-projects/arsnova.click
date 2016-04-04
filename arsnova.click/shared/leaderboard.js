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

Meteor.methods({
    'LeaderBoard.addResponseSet': function ({phashtag, questionIndex, nick, responseTimeMillis}) {
        if (Meteor.isServer){
            new SimpleSchema({
                phashtag: {type: String},
                nick: {type: String},
                responseTimeMillis: {type: Number}
            }).validate({
                phashtag,
                nick,
                responseTimeMillis
            });

            const correctAnswers = [];

            AnswerOptions.find({
                hashtag: phashtag,
                questionIndex: questionIndex,
                isCorrect: 1
            }, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
                correctAnswers.push(answer.answerOptionNumber);
            });

            var responseAmount = 0;
            var falseResponseAmount = 0;

            Responses.find({hashtag: phashtag, userNick: nick}).forEach(function (response) {
                if (correctAnswers.indexOf(response.answerOptionNumber) == -1){
                    falseResponseAmount++;
                }
                responseAmount++;
            });

            var rightResponseAmount = responseAmount-falseResponseAmount;

            var memberEntry = LeaderBoard.findOne({
                hashtag: phashtag,
                userNick: nick
            });

            if (!memberEntry) {
                LeaderBoard.insert({
                    hashtag: phashtag,
                    userNick: nick,
                    responseTimeMillis: responseTimeMillis,
                    givenAnswers: responseAmount,
                    rightAnswers: rightResponseAmount,
                    wrongAnswers: falseResponseAmount
                });
            } else {
                LeaderBoard.update(memberEntry._id, {$set: {givenAnswers: responseAmount, rightAnswers: rightResponseAmount, wrongAnswers: falseResponseAmount}});
            }
        }
    }
});