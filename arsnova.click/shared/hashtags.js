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
        if (Hashtags.find({hashtag: doc.hashtag}).count() > 0){
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
                if (oldDoc.privateKey == privateKey) {
                    throw new Meteor.Error('Hashtags.import', 'You already have this hashtag on this server');
                }
                else {
                    throw new Meteor.Error('Hashtags.import', 'This hashtag is already taken by another user on the server');
                }
                return;
            }
            var hashtagDoc = data.hashtagDoc;
            hashtagDoc.privateKey = privateKey;
            hashtagDoc._id = undefined;
            Hashtags.insert(hashtagDoc);
            delete data.questionGroupDoc._id;
            QuestionGroup.insert(data.questionGroupDoc);
            data.answerOptionsDoc.forEach(function (answerOptionDoc) {
                delete answerOptionDoc._id;
                AnswerOptions.insert(answerOptionDoc);
            });
        }
    }
});