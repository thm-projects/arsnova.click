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
import {Session} from 'meteor/session';
import {QuestionGroup} from '/lib/questions.js';
import {AnswerOptions} from '/lib/answeroptions.js';
import {splashscreenError} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/client/lib/local_storage.js';

export function checkForValidQuestions(index) {
	var questionDoc = QuestionGroup.findOne();
	var answerDoc = AnswerOptions.find({questionIndex: index});
	if (!questionDoc || !answerDoc) {
		return false;
	}

	var question = questionDoc.questionList[index];
	if (!question) {
		return false;
	}

	if (!question.questionText || question.questionText.length < 5 || question.questionText.length > 10000) {
		return false;
	}
	if (!question.timer || isNaN(question.timer) || question.timer < 5000 || question.timer > 260000) {
		return false;
	}

	var hasValidAnswers = false;
	answerDoc.forEach(function (value) {
		if (typeof value.answerText === "undefined" || value.answerText.length <= 500) {
			hasValidAnswers = true;
		}
	});
	return hasValidAnswers;
}

export function addNewQuestion(callback) {
	var index = QuestionGroup.findOne().questionList.length;
	Meteor.call("QuestionGroup.addQuestion", {
		privateKey: localData.getPrivateKey(),
		hashtag: Session.get("hashtag"),
		questionIndex: index,
		questionText: ""
	}, (err) => {
		if (err) {
			splashscreenError.setErrorText(err.reason);
			splashscreenError.open();
		} else {
			for (var i = 0; i < 4; i++) {
				Meteor.call('AnswerOptions.addOption', {
					privateKey: localData.getPrivateKey(),
					hashtag: Session.get("hashtag"),
					questionIndex: index,
					answerOptionNumber: i,
					answerText: "",
					isCorrect: 0
				});
			}

			localData.addQuestion(Session.get("hashtag"), QuestionGroup.findOne().questionList.length, "");

			var validQuestions = Session.get("validQuestions");
			validQuestions[index] = false;
			Session.set("validQuestions", validQuestions);

			Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), index, function () {
				Router.go("/question");
				if (callback) {
					callback();
				}
			});
		}
	});
}

export function calculateTitelHeight() {
	var fixedTop = $(".navbar-fixed-top");
	var container = $(".container");
	var footerHeight = $("#footerBar").hasClass("hide") ? $(".fixed-bottom").outerHeight() + $(".footer-info-bar").outerHeight() : $(".fixed-bottom").outerHeight();
	var finalHeight = $(window).height() - fixedTop.outerHeight() - $(".navbar-fixed-bottom").outerHeight() - footerHeight;

	container.css("height", finalHeight);
	container.css("margin-top", fixedTop.outerHeight());

	$(".kill-session-switch-wrapper").css("top", $(".arsnova-logo").height() * 0.4);
}
