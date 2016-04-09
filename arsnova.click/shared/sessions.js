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
    "Sessions.setQuestion": function ({privateKey, hashtag, questionText}) {
        //TODO: validate questionText with SimpleSchema
        new SimpleSchema({
            questionText: {
                type: String,
                min: 5,
                max: 1000
            }
        }).validate({questionText: questionText});

        var hashtagDoc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (hashtagDoc) {
            var session = Sessions.findOne({hashtag: hashtag});
            if (!session) {
                Sessions.insert({
                    hashtag: hashtag,
                    questionText: questionText,
                    timer: 0,
                    isReadingConfirmationRequired: 1
                });
            } else {
                Sessions.update(session._id, {$set: {questionText: questionText}}, function (error) {
                    if (error) {
                        throw new Meteor.Error('Sessions.setQuestion', error);
                        return;
                    }
                });
            }
        }
    },
    "Sessions.isSC": function ({hashtag}) {
        return (AnswerOptions.find({hashtag: hashtag, isCorrect: 1}).count() == 1);
    },
    "Sessions.updateIsReadConfirmationRequired": function ({privateKey, hashtag, isReadingConfirmationRequired}) {
        new SimpleSchema({
            isReadingConfirmationRequired: {
                type: Number,
                min: 0,
                max: 1
            }
        }).validate({isReadingConfirmationRequired: isReadingConfirmationRequired});

        var hashtagDoc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (hashtagDoc) {
            var session = Sessions.findOne({hashtag: hashtag});
            if (!session) {
                throw new Meteor.Error('Sessions.updateIsReadConfirmationRequired: no access to session');
                return;
            } else {
                Sessions.update(session._id, {$set: {isReadingConfirmationRequired: isReadingConfirmationRequired}}, function (error) {
                    if (error) {
                        throw new Meteor.Error('Sessions.updateIsReadConfirmationRequired', error);
                        return;
                    }
                });
            }
        }
    },
    "Sessions.setTimer": function ({privateKey, hashtag, timer}) {
        new SimpleSchema({
            timer: {
                type: Number,
                min: 0
            }
        }).validate({timer: timer});
        const hashItem = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (hashItem) {
            const session = Sessions.findOne({hashtag: hashtag});
            if (!session) {
                throw new Meteor.Error('Sessions.setTimer: no access to session');
                return;
            } else {
                Sessions.update(session._id, {$set: {timer: timer}}, function (error) {
                    if (error) {
                        throw new Meteor.Error('Sessions.updateIsReadConfirmationRequired', error);
                        return;
                    }
                });
            }
        }
    },
    "Sessions.setVolume": function ({privateKey, hashtag, volume}) {
        new SimpleSchema({
            volume: {
                type: Number,
                min: 0
            }
        }).validate({volume: volume});
        const hashItem = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (hashItem) {
            const session = Sessions.findOne({hashtag: hashtag});
            if (!session) {
                throw new Meteor.Error('Sessions.setTimer: no access to session');
                return;
            } else {
                Sessions.update(session._id, {$set: {volume: volume}}, function (error) {
                    if (error) {
                        throw new Meteor.Error('Sessions.updateIsReadConfirmationRequired', error);
                        return;
                    }
                });
            }
        }
    },
    "Sessions.startTimer": function ({privateKey, hashtag}) {
        if (Meteor.isServer) {
            var startTime = new Date();
            var hashtagDoc = Hashtags.findOne({hashtag: hashtag, privateKey: privateKey});
            if (!hashtagDoc) {
                new Meteor.Error('Sessions.startTimer', 'There is no quiz with this key');
                return;
            }
            var sessionDoc = Sessions.findOne({hashtag: hashtag});
            if (sessionDoc) {
                Sessions.update(sessionDoc._id, {
                    $set: {startTime: startTime.getTime()}
                }, function (error) {
                    if (error){
                        throw new Meteor.Error('Sessions.updateIsReadConfirmationRequired', error);
                        return;
                    }
                });
            }
        }
    }
});