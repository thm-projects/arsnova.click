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
            var dupDoc = Responses.findOne({hashtag: responseDoc.hashtag, answerOptionNumber: responseDoc.answerOptionNumber, userNick: responseDoc.userNick});
            if (dupDoc) {
                throw new Meteor.Error('Responses.addResponse', 'User has already given this response');
                return;
            }
            var hashtagDoc = Hashtags.findOne({
                hashtag: hashtag,
                sessionStatus: 3
            });
            if (!hashtagDoc) {
                throw new Meteor.Error('Responses.addResponse', 'There is no such quiz active in the db');
                return;
            } else {
                var sessionDoc = Sessions.findOne({hashtag: responseDoc.hashtag});
                if (!sessionDoc) {
                    throw new Meteor.Error('Responses.addResponse', 'No session doc for this quiz');
                    return;
                }
                var responseTime = Number(timestamp) - Number(sessionDoc.startTime);

                if (responseTime <= sessionDoc.timer) {
                    responseDoc.responseTime = responseTime;
                    var answerOptionDoc = AnswerOptions.findOne({
                        hashtag: hashtag,
                        answerOptionNumber: responseDoc.answerOptionNumber
                    });
                    if (!answerOptionDoc) {
                        throw new Meteor.Error('Responses.addResponse', 'There is no answer option with the given answerOptionNumber');
                        return;
                    }

                    Responses.insert(responseDoc);

                    Meteor.call('LeaderBoard.addResponseSet', {
                        phashtag: responseDoc.hashtag,
                        nick: responseDoc.userNick,
                        responseTimeMillis: responseDoc.responseTime
                    });

                    var questionType = "polling";
                    var nickResponsesCount = Responses.find({
                        hashtag: hashtag,
                        userNick: responseDoc.userNick
                    }).count();
                    var showForwardButton = false;
                    if (nickResponsesCount > 1) {
                        showForwardButton = true;
                    }
                    var instantRouting = false;
                    var correctAnswerOptionsCount = AnswerOptions.find({hashtag: responseDoc.hashtag, isCorrect: 1}).count();
                    if (correctAnswerOptionsCount === 1) {
                        instantRouting = true;
                    }
                    var retDoc = {
                        isCorrect: answerOptionDoc.isCorrect,
                        instantRouting: instantRouting,
                        showForwardButton: showForwardButton
                    }
                    return retDoc;
                }
                else {
                    throw new Meteor.Error('Responses.addResponse', 'Response was given out of time range');
                    return;
                }
            }
        }
    }
});