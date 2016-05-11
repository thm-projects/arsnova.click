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
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {QuestionGroupCollection, QuestionGroupSchema} from '/lib/questions/collection.js';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';

Meteor.methods({
	"QuestionGroupCollection.insert": function ({hashtag, questionList}) {
		QuestionGroupSchema.validate({
			hashtag: hashtag,
			questionList: questionList
		});

		if (QuestionGroupCollection.find({hashtag: hashtag}).count() > 0) {
			QuestionGroupCollection.update({hashtag: hashtag}, {$set: {questionList: questionList}});
		} else {
			QuestionGroupCollection.insert({
				hashtag: hashtag,
				questionList: questionList
			});
		}
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.insert",
					value: {}
				}
			}
		});
	},
	"QuestionGroupCollection.addQuestion": function ({hashtag, questionIndex, questionText}) {
		new SimpleSchema({
			questionText: {type: String},
			questionIndex: {type: Number}
		}).validate({questionIndex: questionIndex, questionText: questionText});

		var questionGroup = QuestionGroupCollection.findOne({hashtag: hashtag});
		var questionItem = {
			questionText: questionText,
			timer: 40000,
			isReadingConfirmationRequired: 1
		};
		if (!questionGroup) {
			QuestionGroupCollection.insert({
				hashtag: hashtag,
				questionList: [questionItem]
			});
		} else {
			if (questionIndex < questionGroup.questionList.length) {
				questionGroup.questionList[questionIndex].questionText = questionText;
			} else {
				questionGroup.questionList.push(questionItem);
			}
			QuestionGroupCollection.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}});
		}
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.addQuestion",
					value: {questionIndex: questionIndex}
				}
			}
		});
	},
	"QuestionGroupCollection.removeQuestion": function ({hashtag, questionIndex}) {
		var questionGroup = QuestionGroupCollection.findOne({hashtag: hashtag});
		if (questionGroup) {
			questionGroup.questionList.splice(questionIndex, 1);
			QuestionGroupCollection.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}});
		}
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.addQuestion",
					value: {questionIndex: questionIndex}
				}
			}
		});
	},
	"Question.isSC": function ({hashtag, questionIndex}) {
		return (AnswerOptionCollection.find({
			hashtag: hashtag,
			questionIndex: questionIndex,
			isCorrect: 1
		}).count() === 1);
	},
	"Question.updateIsReadConfirmationRequired": function ({hashtag, questionIndex, isReadingConfirmationRequired}) {
		new SimpleSchema({
			isReadingConfirmationRequired: {
				type: Number,
				min: 0,
				max: 1
			}
		}).validate({isReadingConfirmationRequired: isReadingConfirmationRequired});

		var questionGroup = QuestionGroupCollection.findOne({hashtag: hashtag});
		if (!questionGroup) {
			throw new Meteor.Error('Question.updateIsReadConfirmationRequired', 'hashtag_not_found');
		}
		questionGroup.questionList[questionIndex].isReadingConfirmationRequired = isReadingConfirmationRequired;
		QuestionGroupCollection.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.updateIsReadConfirmationRequired",
					value: {questionIndex: questionIndex}
				}
			}
		});
	},
	"Question.setTimer": function ({hashtag, questionIndex, timer}) {
		new SimpleSchema({
			timer: {
				type: Number,
				min: 0
			}
		}).validate({timer: timer});
		var questionGroup = QuestionGroupCollection.findOne();
		if (!questionGroup) {
			throw new Meteor.Error('Question.setTimer', 'hashtag_not_found');
		}

		questionGroup.questionList[questionIndex].timer = timer;
		QuestionGroupCollection.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.setTimer",
					value: {
						questionIndex: questionIndex,
						timer: timer
					}
				}
			}
		});
	},
	"Question.startTimer": function ({hashtag, questionIndex}) {
		var startTime = new Date();

		var questionGroup = QuestionGroupCollection.findOne({hashtag: hashtag});
		if (!questionGroup) {
			throw new Meteor.Error('Question.startTimer', 'hashtag_not_found');
		}
		questionGroup.questionList[questionIndex].startTime = startTime.getTime();
		QuestionGroupCollection.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}});
		EventManagerCollection.update({hashtag: hashtag}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.setTimer",
					value: {questionIndex: questionIndex}
				}
			}
		});
	}
});
