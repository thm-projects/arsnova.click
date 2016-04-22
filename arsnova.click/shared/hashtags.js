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

import {Meteor} from 'meteor/meteor';
import {AnswerOptions} from '/lib/answeroptions.js';
import {MemberList} from '/lib/memberlist.js';
import {Responses} from '/lib/responses.js';
import {QuestionGroup} from '/lib/questions.js';
import {Hashtags} from '/lib/hashtags.js';

Meteor.methods({
    'Hashtags.checkPrivateKey': function (privateKey, hashtag) {
        new SimpleSchema({
            hashtag: {type: String},
            privateKey: {type: String}
        }).validate({
            privateKey,
            hashtag
        });
        var doc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        return Boolean(doc);
    },
    'Hashtags.addHashtag': function (doc) {
        if (Hashtags.find({hashtag: doc.hashtag}).count() > 0) {
            throw new Meteor.Error('Hashtags.addHashtag', 'Session already exists!');
        }

        Hashtags.insert(doc);
    },
    'Hashtags.export': function ({hashtag, privateKey}) {
        if (Meteor.isServer) {
            var hashtagDoc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            }, {
                fields: {
                    _id: 0,
                    privateKey: 0
                }
            });
            if (!hashtagDoc) {
                throw new Meteor.Error('Hashtags.export', 'No such hashtag with the given key');
            }
            var questionGroupDoc = QuestionGroup.findOne({hashtag: hashtag}, {
                fields: {
                    _id: 0
                }
            });
            var answerOptionsDoc = AnswerOptions.find({hashtag: hashtag}, {
                fields: {
                    _id: 0
                }
            }).fetch();
            var memberListDoc = MemberList.find({hashtag: hashtag}, {
                fields: {
                    _id: 0
                }
            }).fetch();
            var responsesDoc = Responses.find({hashtag: hashtag}, {
                fields: {
                    _id: 0
                }
            }).fetch();
            var exportData = {
                hashtagDoc: hashtagDoc,
                questionGroupDoc: questionGroupDoc,
                answerOptionsDoc: answerOptionsDoc,
                memberListDoc: memberListDoc,
                responsesDoc: responsesDoc
            };
            return JSON.stringify(exportData);
        }
    },
    'Hashtags.import': function ({privateKey, data}) {
        if (Meteor.isServer) {
            var hashtag = data.hashtagDoc.hashtag;
            var oldDoc = Hashtags.findOne({hashtag: hashtag});
            if (oldDoc) {
                throw new Meteor.Error('Hashtags.import', 'Dieser Hashtag ist bereits vorhanden');
            }
            var questionList = [];
            var hashtagDoc = data.hashtagDoc;
            hashtagDoc.privateKey = privateKey;
            delete hashtagDoc._id;
            Hashtags.insert(hashtagDoc);
            for (var i = 0; i < data.sessionDoc.length; i++) {
                var question = data.sessionDoc[i];
                questionList.push({
                    questionText: question.questionText,
                    timer: question.timer
                });
                for (var j = 0; j < question.answers.length; j++) {
                    var answer = question.answers[j];
                    AnswerOptions.insert({
                        hashtag: hashtag,
                        questionIndex: i,
                        answerText: answer.answerText,
                        answerOptionNumber: answer.answerOptionNumber,
                        isCorrect: answer.isCorrect
                    });
                }
            }
            QuestionGroup.insert({
                hashtag: hashtag,
                questionList: questionList
            });
        }
    }
});
