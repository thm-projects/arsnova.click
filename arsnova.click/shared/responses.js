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
    'Responses.addResponse'(responseDoc) {
        var timestamp = new Date().getTime();
        var hashtag = responseDoc.hashtag;
        if (Meteor.isServer) {
            var dupDoc = Responses.findOne({
                hashtag: responseDoc.hashtag,
                questionIndex: responseDoc.questionIndex,
                answerOptionNumber: responseDoc.answerOptionNumber,
                userNick: responseDoc.userNick
            });
            if (dupDoc) {
                throw new Meteor.Error('Responses.addResponse', 'User has already given this response');
            }
            var hashtagDoc = Hashtags.findOne({
                hashtag: hashtag,
                sessionStatus: 3
            });
            if (!hashtagDoc) {
                throw new Meteor.Error('Responses.addResponse', 'There is no such quiz active in the db');
            } else {
                var questionGroupDoc = QuestionGroup.findOne({hashtag: responseDoc.hashtag});
                if (!questionGroupDoc) {
                    throw new Meteor.Error('Responses.addResponse', 'No questionGroup doc for this quiz');
                }
                var responseTime = Number(timestamp) - Number(questionGroupDoc.questionList[responseDoc.questionIndex].startTime);

                if (responseTime <= questionGroupDoc.questionList[responseDoc.questionIndex].timer) {
                    responseDoc.responseTime = responseTime;
                    var answerOptionDoc = AnswerOptions.findOne({
                        hashtag: hashtag,
                        questionIndex: responseDoc.questionIndex,
                        answerOptionNumber: responseDoc.answerOptionNumber
                    });
                    if (!answerOptionDoc) {
                        throw new Meteor.Error('Responses.addResponse', 'There is no answer option with the given answerOptionNumber');
                    }

                    Responses.insert(responseDoc);

                    Meteor.call('LeaderBoard.addResponseSet', {
                        phashtag: responseDoc.hashtag,
                        questionIndex: responseDoc.questionIndex,
                        nick: responseDoc.userNick,
                        responseTimeMillis: responseDoc.responseTime
                    });

                    /*
                    var nickResponsesCount = Responses.find({
                        hashtag: hashtag,
                        userNick: responseDoc.userNick
                    }).count();
                    var correctAnswerOptionsCount = AnswerOptions.find({hashtag: responseDoc.hashtag, questionIndex: responseDoc.questionIndex, isCorrect: 1}).count();
                    return {
                        isCorrect: answerOptionDoc.isCorrect,
                        instantRouting: correctAnswerOptionsCount === 1,
                        showForwardButton: nickResponsesCount <= 1
                    };
                    */
                }
                else {
                    throw new Meteor.Error('Responses.addResponse', 'Response was given out of time range');
                }
            }
        }
    },
    'Responses.clearAll': function (privateKey, hashtag) {
        if (Meteor.isServer) {
            var hashtagDoc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
            if (!hashtagDoc) {
                throw new Meteor.Error('Responses.clearAll', 'There is no such quiz active in the db');
            }

            Responses.remove({hashtag: hashtag});
        }
    }
});