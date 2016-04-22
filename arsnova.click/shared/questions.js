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

import { Meteor } from 'meteor/meteor';
import { AnswerOptions } from '/lib/answeroptions.js';
import { QuestionGroup, QuestionGroupSchema } from '/lib/questions.js';
import { Hashtags } from '/lib/hashtags.js';

Meteor.methods({
    "QuestionGroup.insert": function ({privateKey, hashtag, questionList}) {
        if(Meteor.isServer) {
            QuestionGroupSchema.validate({
                hashtag: hashtag,
                questionList: questionList
            });

            var hashtagDoc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
            if (!hashtagDoc) {
                throw new Meteor.Error('QuestionGroup.insert', 'There is no quiz with this key');
            }

            if(QuestionGroup.find({hashtag: hashtag}).count() > 0) {
                QuestionGroup.update({hashtag: hashtag},{$set: {questionList: questionList}});
            } else {
                QuestionGroup.insert({
                    hashtag: hashtag,
                    questionList: questionList
                });
            }
        }
    },
    "QuestionGroup.addQuestion": function ({privateKey, hashtag, questionIndex, questionText}) {
        if(Meteor.isServer) {
            new SimpleSchema({
                questionText: {type: String},
                questionIndex: {type: Number}
            }).validate({questionIndex: questionIndex, questionText: questionText});

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
                timer: 40000,
                isReadingConfirmationRequired: 1
            };
            if (!questionGroup) {
                QuestionGroup.insert({
                    hashtag: hashtag,
                    questionList: [questionItem]
                });
            } else {
                if(questionIndex < questionGroup.questionList.length) {
                    questionGroup.questionList[questionIndex].questionText = questionText;
                } else {
                    questionGroup.questionList.push(questionItem);
                }
                QuestionGroup.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}}, function (error) {
                    if (error) {
                        throw new Meteor.Error('QuestionGroup.addQuestion', error);
                    }
                });
            }
        }
    },
    "QuestionGroup.removeQuestion": function({privateKey, hashtag, questionIndex}) {
        if(Meteor.isServer) {
            var hashtagDoc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
            if (!hashtagDoc) {
                throw new Meteor.Error('QuestionGroup.removeQuestion', 'There is no quiz with this key');
            }
            var questionGroup = QuestionGroup.findOne({hashtag: hashtag});
            if (questionGroup) {
                questionGroup.questionList.splice(questionIndex, 1);
                QuestionGroup.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}}, function (error) {
                    if (error) {
                        throw new Meteor.Error('QuestionGroup.removeQuestion', error);
                    }
                });
            }
        }
    },
    "Question.isSC": function ({hashtag, questionIndex}) {
        return (AnswerOptions.find({hashtag: hashtag, questionIndex: questionIndex, isCorrect: 1}).count() === 1);
    },
    "Question.updateIsReadConfirmationRequired": function ({privateKey, hashtag, questionIndex, isReadingConfirmationRequired}) {
        if (Meteor.isServer) {
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
                throw new Meteor.Error('Question.updateIsReadConfirmationRequired', 'There is no quiz with this key');
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
        }
    },
    "Question.setTimer": function ({privateKey, hashtag, questionIndex, timer}) {
        if (Meteor.isServer) {
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
                throw new Meteor.Error('Question.setTimer', 'There is no quiz with this key');
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
                throw new Meteor.Error('Question.startTimer', 'There is no quiz with this key');
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