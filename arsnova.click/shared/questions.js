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
import {hashtagSchema} from '/lib/hashtags/collection.js';
import {QuestionGroupCollection, questionGroupSchema, questionTextSchema, timerSchema} from '/lib/questions/collection.js';
import {EventManagerCollection, questionIndexSchema} from '/lib/eventmanager/collection.js';

Meteor.methods({
	"QuestionGroupCollection.insert": function (questionGroup) {
		console.log("insert", questionGroup);
		questionGroupSchema.validate({
			hashtag: questionGroup.getHashtag(),
			questionList: questionGroup.getQuestionList()
		});

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = questionGroup.getHashtag();
		}
		if (QuestionGroupCollection.find(query).count() > 0) {
			QuestionGroupCollection.update(query, questionGroup);
		} else {
			QuestionGroupCollection.insert(questionGroup);
			for (let i = 0; i < questionGroup.getQuestionList().length; i++) {
				const questionItem = questionGroup.getQuestionList()[i];
				for (let j = 0; j < questionItem.getAnswerOptionList(); j++) {
					const answerItem = questionItem.getAnswerOptionList()[j];
					Meteor.call("AnswerOptionCollection.addOption", {
						hashtag: questionGroup.getHashtag(),
						questionIndex: questionItem.getQuestionIndex(),
						answerText: answerItem.getAnswerText(),
						answerOptionNumber: answerItem.getAnswerOptionNumber(),
						isCorrect: answerItem.getIsCorrect()
					});
				}
			}
		}
		EventManagerCollection.update({hashtag: questionGroup.getHashtag()}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.insert",
					value: {}
				}
			}
		});
	},
	"QuestionGroupCollection.addQuestion": function (questionItem) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema,
			questionText: questionTextSchema
		}).validate({hashtag: questionItem.getHashtag(), questionIndex: questionItem.getQuestionIndex(), questionText: questionItem.getQuestionText()});

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = questionItem.getHashtag();
		}
		var questionGroup = QuestionGroupCollection.findOne(query);
		if (!questionGroup) {
			QuestionGroupCollection.insert({
				hashtag: questionItem.getHashtag(),
				questionList: [questionItem]
			});
		} else {
			if (questionItem.getQuestionIndex() < questionGroup.questionList.length) {
				questionGroup.questionList[questionItem.getQuestionIndex()].questionText = questionItem.getQuestionIndex();
			} else {
				questionGroup.questionList.push(questionItem.serialize());
			}
			QuestionGroupCollection.update(questionGroup._id, {$set: {questionList: questionGroup.questionList}});
		}
		EventManagerCollection.update({hashtag: questionItem.getHashtag()}, {
			$push: {
				eventStack: {
					key: "QuestionGroupCollection.addQuestion",
					value: {questionIndex: questionItem.getQuestionIndex()}
				}
			}
		});
	},
	"QuestionGroupCollection.removeQuestion": function ({hashtag, questionIndex}) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema
		}).validate({hashtag, questionIndex});

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = hashtag;
		}
		var questionGroup = QuestionGroupCollection.findOne(query);
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
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema
		}).validate({hashtag, questionIndex});

		return (AnswerOptionCollection.find({
			hashtag: hashtag,
			questionIndex: questionIndex,
			isCorrect: 1
		}).count() === 1);
	},
	"Question.setTimer": function ({hashtag, questionIndex, timer}) {
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema,
			timer: timerSchema
		}).validate({hashtag, questionIndex, timer});

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = hashtag;
		}
		var questionGroup = QuestionGroupCollection.findOne(query);
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
		new SimpleSchema({
			hashtag: hashtagSchema,
			questionIndex: questionIndexSchema
		}).validate({hashtag, questionIndex});

		var startTime = new Date();

		const query = {};
		if (Meteor.isServer) {
			query.hashtag = hashtag;
		}
		var questionGroup = QuestionGroupCollection.findOne(query);
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
