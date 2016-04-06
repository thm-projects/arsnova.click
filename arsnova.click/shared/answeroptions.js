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
    'AnswerOptions.addOption'({privateKey, hashtag, questionIndex, answerText, answerOptionNumber, isCorrect}) {
        new SimpleSchema({
            privateKey: { type: String },
            hashtag: { type: String },
            questionIndex: { type: Number },
            answerText: { type: String },
            answerOptionNumber: { type: Number },
            isCorrect: { type: Number }
        }).validate({ privateKey, hashtag, questionIndex, answerText, answerOptionNumber, isCorrect });
        var doc = true;
        if (Meteor.isServer) {
            doc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
        }
        if (!doc) {
            throw new Meteor.Error('AnswerOptions.addOption', 'Either there is no quiz or you don\'t have write access');
        }
        if (AnswerOptions.find({hashtag: hashtag, questionIndex: questionIndex}).count() > 25) {
            throw new Meteor.Error('AnswerOptions.addOption', 'Maximum number of possible answer options exceeded');
        }
        var answerOptionDoc = AnswerOptions.findOne({hashtag: hashtag, questionIndex: questionIndex, answerOptionNumber: answerOptionNumber});
        if (!answerOptionDoc) {
            AnswerOptions.insert({
                hashtag: hashtag,
                questionIndex: questionIndex,
                answerText: answerText,
                answerOptionNumber: answerOptionNumber,
                isCorrect: isCorrect
            });
        } else {
            AnswerOptions.update(answerOptionDoc._id, {
                $set: {
                    answerText: answerText,
                    isCorrect: isCorrect
                }
            });
        }
    },
    'AnswerOptions.deleteOption'({privateKey, hashtag, questionIndex, answerOptionNumber}) {
        if (Meteor.isServer) {
            new SimpleSchema({
                privateKey: { type: String },
                hashtag: { type: String },
                questionIndex: { type: Number },
                answerOptionNumber: { type: Number }
            }).validate({ privateKey, hashtag, questionIndex, answerOptionNumber });
            var doc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
            if (!doc) {
                throw new Meteor.Error('AnswerOptions.deleteOption', 'Either there is no quiz or you don\'t have write access');
            }
            else {
                AnswerOptions.remove({
                    hashtag: hashtag,
                    questionIndex: questionIndex,
                    answerOptionNumber: answerOptionNumber
                });
            }
        }
    },
    'AnswerOptions.updateAnswerTextAndIsCorrect'({privateKey, hashtag, questionIndex, answerOptionNumber, answerText, isCorrect}) {
        new SimpleSchema({
            privateKey: { type: String },
            hashtag: { type: String },
            questionIndex: { type: Number },
            answerOptionNumber: { type: Number },
            answerText: { type: String },
            isCorrect: { type: Number }
        }).validate({ privateKey, hashtag, questionIndex, answerOptionNumber, answerText, isCorrect });
        var doc = true;
        if (Meteor.isServer) {
            doc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
        }
        if (!doc) {
            throw new Meteor.Error('AnswerOptions.updateAnswerTextAndIsCorrect', 'Either there is no quiz or you don\'t have write access');
        }
        var answerOptionDoc = AnswerOptions.findOne({
            hashtag: hashtag,
            questionIndex: questionIndex,
            answerOptionNumber: answerOptionNumber
        });
        AnswerOptions.update(answerOptionDoc._id, {
            $set: {answerText: answerText, isCorrect: isCorrect}
        });
        if (Meteor.isClient){
            localData.updateAnswerText({hashtag, questionIndex, answerOptionNumber, answerText, isCorrect});
        }
    }
});
