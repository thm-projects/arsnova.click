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
import {Mongo} from 'meteor/mongo';

export function getLanguage() {
	return $.parseJSON(localStorage.getItem("__amplify__tap-i18n-language"));
}

export function getAllHashtags() {
	var hashtagString = localStorage.getItem("hashtags");
	if (!hashtagString) {
		localStorage.setItem("hashtags", JSON.stringify([]));
		return [];
	}
	return JSON.parse(hashtagString).sort();
}

export function containsHashtag(hashtag) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return;
	}
	const hashtagString = localStorage.getItem("hashtags");
	return hashtagString ? $.inArray(hashtag, JSON.parse(hashtagString)) > -1 : false;
}

export function deleteHashtag(hashtag) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return;
	}
	var allHashtags = JSON.parse(localStorage.getItem("hashtags"));
	if (!allHashtags) {
		return false;
	}
	var index = $.inArray(hashtag, allHashtags);
	if (index > -1) {
		localStorage.removeItem(hashtag);
		allHashtags.splice(index, 1);
		localStorage.setItem("hashtags", JSON.stringify(allHashtags));
	}
}

export function addHashtag(hashtag) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return;
	}
	var questionObject = {
		hashtag: hashtag,
		questionList: [
			{
				questionText: "",
				timer: 40000,
				answers: [
					{
						answerOptionNumber: 0,
						answerText: "",
						isCorrect: 0
					},
					{
						answerOptionNumber: 1,
						answerText: "",
						isCorrect: 0
					},
					{
						answerOptionNumber: 2,
						answerText: "",
						isCorrect: 0
					},
					{
						answerOptionNumber: 3,
						answerText: "",
						isCorrect: 0
					}
				]
			}
		]
	};
	const hashtagString = localStorage.getItem("hashtags");
	if (!hashtagString) {
		localStorage.setItem("hashtags", JSON.stringify([hashtag]));
		localStorage.setItem(hashtag, JSON.stringify(questionObject));
	} else {
		const hashtags = JSON.parse(hashtagString);
		hashtags.push(hashtag);

		localStorage.setItem("hashtags", JSON.stringify(hashtags));
		localStorage.setItem(hashtag, JSON.stringify(questionObject));
	}
}

export function addQuestion(hashtag, questionIndex, questionText) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return;
	}
	const sessionDataString = localStorage.getItem(hashtag);
	if (sessionDataString) {
		const sessionData = JSON.parse(sessionDataString);
		if (questionIndex < sessionData.questionList.length) {
			sessionData.questionList[questionIndex].questionText = questionText;
		} else {
			sessionData.questionList.push({
				questionText: questionText,
				timer: 40000,
				answers: [
					{
						answerOptionNumber: 0,
						answerText: "",
						isCorrect: 0
					},
					{
						answerOptionNumber: 1,
						answerText: "",
						isCorrect: 0
					},
					{
						answerOptionNumber: 2,
						answerText: "",
						isCorrect: 0
					},
					{
						answerOptionNumber: 3,
						answerText: "",
						isCorrect: 0
					}
				]
			});
		}
		localStorage.setItem(hashtag, JSON.stringify(sessionData));
	}
}

export function removeQuestion(hashtag, questionIndex) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return;
	}
	const sessionDataString = localStorage.getItem(hashtag);
	if (sessionDataString) {
		const sessionData = JSON.parse(sessionDataString);
		sessionData.questionList.splice(questionIndex, 1);
		localStorage.setItem(hashtag, JSON.stringify(sessionData));
	}
}

export function addTimer(hashtag, questionIndex, timer) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return;
	}
	const sessionDataString = localStorage.getItem(hashtag);
	if (sessionDataString) {
		const sessionData = JSON.parse(sessionDataString);
		sessionData.questionList[questionIndex].timer = timer;
		localStorage.setItem(hashtag, JSON.stringify(sessionData));
	}
}

export function addAnswers({hashtag, questionIndex, answerOptionNumber, answerText, isCorrect}) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return;
	}
	const sessionDataString = localStorage.getItem(hashtag);
	if (sessionDataString) {
		const sessionData = JSON.parse(sessionDataString);
		if (!sessionData.questionList[questionIndex].answers) {
			sessionData.questionList[questionIndex].answers = [];
		}
		sessionData.questionList[questionIndex].answers.push({
			answerOptionNumber: answerOptionNumber,
			answerText: answerText,
			isCorrect: isCorrect
		});
		localStorage.setItem(hashtag, JSON.stringify(sessionData));
	}
}

export function reenterSession(hashtag) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return;
	}

	const sessionDataString = localStorage.getItem(hashtag);
	if (!sessionDataString) {
		return;
	}

	const sessionData = JSON.parse(sessionDataString);

	if (typeof sessionData === "object") {
		/*
		 This supports the "old" question format where one question was bound to one hashtag.
		 It saves the content of the question to the new questionList and deletes the invalid keys.
		 TODO: remove later when it is likely that there are no more sessions with the old question format
		 */
		if (typeof sessionData.questionList === "undefined") {
			sessionData.questionList = [
				{
					questionText: sessionData.questionText,
					timer: sessionData.timer,
					answers: sessionData.answers
				}
			];
			delete sessionData.questionText;
			delete sessionData.timer;
			delete sessionData.answers;
			delete sessionData.isReadingConfirmationRequired;
			localStorage.setItem(hashtag, JSON.stringify(sessionData));
		}

		for (var i = 0; i < sessionData.questionList.length; i++) {
			if (!sessionData.questionList[i].answers) {
				continue;
			}
			var answer = sessionData.questionList[i].answers;
			delete sessionData.questionList[i].answers;
			delete sessionData.questionList[i].isReadingConfirmationRequired;
			for (var j = 0; j < answer.length; j++) {
				Meteor.call("AnswerOptionCollection.addOption", {
					hashtag: hashtag,
					questionIndex: i,
					answerText: answer[j].answerText,
					answerOptionNumber: answer[j].answerOptionNumber,
					isCorrect: answer[j].isCorrect
				});
			}
		}
		Meteor.call("QuestionGroupCollection.insert", {
			hashtag: hashtag,
			questionList: sessionData.questionList
		});
	}
}

export function deleteAnswerOption(hashtag, questionIndex, answerOptionNumber) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return;
	}
	const sessionDataString = localStorage.getItem(hashtag);
	if (!sessionDataString) {
		return;
	}

	const sessionData = JSON.parse(sessionDataString);
	if (typeof sessionData === "object") {
		sessionData.questionList[questionIndex].answers = $.grep(sessionData.questionList[questionIndex].answers, function (value) {
			return value.answerOptionNumber !== answerOptionNumber;
		});

		localStorage.setItem(hashtag, JSON.stringify(sessionData));
	}
}

export function updateAnswerText({hashtag, questionIndex, answerOptionNumber, answerText, isCorrect}) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return;
	}
	const sessionDataString = localStorage.getItem(hashtag);
	if (!sessionDataString) {
		return;
	}

	const sessionData = JSON.parse(sessionDataString);
	if (typeof sessionData === "object") {
		$.each(sessionData.questionList[questionIndex].answers, function (key, value) {
			if (value.answerOptionNumber === answerOptionNumber) {
				value.answerText = answerText;
				value.isCorrect = isCorrect;
			}
		});
		localStorage.setItem(hashtag, JSON.stringify(sessionData));
	}
}

export function initializePrivateKey() {
	if (!localStorage.getItem("privateKey")) {
		localStorage.setItem("privateKey", new Mongo.ObjectID()._str);
	}
}

export function getPrivateKey() {
	return localStorage.getItem("privateKey");
}

export function importFromFile(data) {
	var hashtag = data.hashtagDoc.hashtag;
	if ((hashtag === "hashtags") || (hashtag === "privateKey")) {
		return;
	}

	var allHashtags = JSON.parse(localStorage.getItem("hashtags"));
	allHashtags = $.grep(allHashtags, function (value) {
		return value !== data.hashtagDoc.hashtag;
	});
	allHashtags.push(hashtag);
	localStorage.setItem("hashtags", JSON.stringify(allHashtags));

	var questionList = [];
	data.sessionDoc.forEach(function (questionListDoc) {
		questionList.push({
			questionText: questionListDoc.questionText,
			timer: questionListDoc.timer,
			answers: questionListDoc.answers
		});
	});

	localStorage.setItem(hashtag, JSON.stringify({
		hashtag: data.hashtagDoc.hashtag,
		questionList: questionList
	}));
}

export function exportFromLocalStorage(hashtag) {
	var localStorageData = JSON.parse(localStorage.getItem(hashtag));
	if (localStorageData) {
		var hashtagDoc = {
			hashtag: localStorageData.hashtag,
			sessionStatus: 0,
			lastConnection: 0
		};
		var sessionDoc = [];
		localStorageData.questionList.forEach(function (question) {
			sessionDoc.push(question);
		});

		return JSON.stringify({
			hashtagDoc: hashtagDoc,
			sessionDoc: sessionDoc,
			memberListDoc: [],
			responsesDoc: []
		});
	}
}
