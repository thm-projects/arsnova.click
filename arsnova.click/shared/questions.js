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
    "QuestionGroup.insert": function ({privateKey, hashtag, questionGroupObject}) {
        QuestionGroupSchema.validate({
            hashtag: hashtag,
            questionList: questionGroupObject
        });

        var hashtagDoc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (!hashtagDoc) {
            throw new Meteor.Error('QuestionGroup.insert', 'There is no quiz with this key');
        }

        QuestionGroup.insert({
            hashtag: hashtag,
            questionList: questionGroupObject
        });
    },
    "QuestionGroup.addQuestion": function ({privateKey, hashtag, questionText}) {
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
        if (!hashtagDoc) {
            throw new Meteor.Error('QuestionGroup.addQuestion', 'There is no quiz with this key');
        }
        var questionGroup = QuestionGroup.findOne({hashtag: hashtag});
        var questionItem = {
            questionText: questionText,
            timer: 0,
            isReadingConfirmationRequired: 1
        };
        if (!questionGroup) {
            QuestionGroup.insert({
                hashtag: hashtag,
                questionList: [questionItem]
            });
        } else {
            questionGroup.questionList.push(questionItem);
            QuestionGroup.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}}, function (error) {
                if (error) {
                    throw new Meteor.Error('Sessions.setQuestion', error);
                }
            });
        }
    },
    "QuestionGroup.removeQuestion": function({privateKey, hashtag, questionIndex}) {
        var hashtagDoc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (!hashtagDoc) {
            new Meteor.Error('QuestionGroup.removeQuestion', 'There is no quiz with this key');
            return;
        }
        var questionGroup = QuestionGroup.findOne({hashtag: hashtag});
        if (questionGroup) {
            QuestionGroup.update(questionGroup._id, {$set: {questionList: questionGroup.questionList.splice(questionIndex)}}, function (error) {
                if (error) {
                    throw new Meteor.Error('Sessions.setQuestion', error);
                }
            });
        }
    },
    "Question.isSC": function ({hashtag, questionIndex}) {
        var hashtagDoc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (!hashtagDoc) {
            new Meteor.Error('Question.isSC', 'There is no quiz with this key');
            return;
        }
        return (AnswerOptions.find({hashtag: hashtag, questionIndex: questionIndex, isCorrect: 1}).count() === 1);
    },
    "Question.updateIsReadConfirmationRequired": function ({privateKey, hashtag, questionIndex, isReadingConfirmationRequired}) {
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
        if (!hashtagDoc) {
            new Meteor.Error('Question.updateIsReadConfirmationRequired', 'There is no quiz with this key');
            return;
        }

        var questionGroup = QuestionGroup.findOne({hashtag: hashtag});
        if (!questionGroup) {
            throw new Meteor.Error('Question.updateIsReadConfirmationRequired', 'no access to session');
        } else {
            questionGroup.questionList[questionIndex].isReadingConfirmationRequired = isReadingConfirmationRequired;
            QuestionGroup.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}}, function (error) {
                if (error) {
                    throw new Meteor.Error('Question.updateIsReadConfirmationRequired', error);
                }
            });
        }
    },
    "Question.setTimer": function ({privateKey, hashtag, questionIndex, timer}) {
        new SimpleSchema({
            timer: {
                type: Number,
                min: 0
            }
        }).validate({timer: timer});

        var hashtagDoc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (!hashtagDoc) {
            new Meteor.Error('Question.setTimer', 'There is no quiz with this key');
            return;
        }

        var questionGroup = QuestionGroup.findOne({hashtag: hashtag});
        if (!questionGroup) {
            throw new Meteor.Error('Question.setTimer', 'no access to session');
        } else {
            questionGroup.questionList[questionIndex].timer = timer;
            QuestionGroup.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}}, function (error) {
                if (error) {
                    throw new Meteor.Error('Question.setTimer', error);
                }
            });
        }
    },
    "Question.startTimer": function ({privateKey, hashtag, questionIndex}) {
        if (Meteor.isServer) {
            var startTime = new Date();

            var hashtagDoc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
            if (!hashtagDoc) {
                new Meteor.Error('Question.startTimer', 'There is no quiz with this key');
                return;
            }
            var questionGroup = QuestionGroup.findOne({hashtag: hashtag});
            if (!questionGroup) {
                throw new Meteor.Error('Question.startTimer: no access to session');
            } else {
                questionGroup.questionList[questionIndex].startTime = startTime.getTime();
                QuestionGroup.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}}, function (error) {
                    if (error){
                        throw new Meteor.Error('Question.startTimer', error);
                    }
                });
            }
        }
    }
});