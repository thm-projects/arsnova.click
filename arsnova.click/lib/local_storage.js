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

import {Mongo} from 'meteor/mongo';
import {Tracker} from 'meteor/tracker';
import {AbstractQuestionGroup} from "/lib/questions/questiongroup_abstract.js";
import {DefaultQuestionGroup} from "/lib/questions/questiongroup_default.js";
import {AbstractQuestion} from "/lib/questions/question_abstract.js";

export const ownHashtagsTracker = new Tracker.Dependency();

export function getLanguage() {
	return localStorage.getItem("language");
}

export function setLanguage(language) {
	localStorage.setItem("language", language);
}

export function getAllHashtags() {
	const hashtagString = localStorage.getItem("hashtags");
	if (!hashtagString) {
		localStorage.setItem("hashtags", JSON.stringify([]));
		return [];
	}
	return JSON.parse(hashtagString).sort();
}

export function getAllLoweredHashtags() {
	const hashtagString = localStorage.getItem("hashtags");
	if (!hashtagString) {
		localStorage.setItem("hashtags", JSON.stringify([]));
		return [];
	}
	const sortedHashtags = JSON.parse(hashtagString).sort();
	const loweredSortedHastags = [];
	$.each(sortedHashtags, function (i, hashtag) {
		loweredSortedHastags.push(hashtag.toLowerCase());
	});
	return loweredSortedHastags;
}

export function containsHashtag(hashtag) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return false;
	}
	const hashtagString = localStorage.getItem("hashtags");
	if (!hashtagString) {
		return false;
	} else {
		const loweredHashtags = [];
		$.each(JSON.parse(hashtagString), function (i, hashtagElement) {
			loweredHashtags.push(hashtagElement.toLowerCase());
		});
		const loweredHashtag = hashtag.toLowerCase();
		return $.inArray(loweredHashtag, loweredHashtags) > -1;
	}
}

export function deleteHashtag(hashtag) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		return;
	}
	const allHashtags = JSON.parse(localStorage.getItem("hashtags"));
	if (!allHashtags) {
		return false;
	}
	const index = $.inArray(hashtag, allHashtags);
	if (index > -1) {
		localStorage.removeItem(hashtag);
		allHashtags.splice(index, 1);
		localStorage.setItem("hashtags", JSON.stringify(allHashtags));
	}
}

export function addHashtag(questionGroup) {
	if (!(questionGroup instanceof AbstractQuestionGroup)) {
		return;
	}
	const hashtagString = localStorage.getItem("hashtags");
	if (!hashtagString) {
		localStorage.setItem("hashtags", JSON.stringify([questionGroup.getHashtag()]));
		localStorage.setItem(questionGroup.getHashtag(), JSON.stringify(questionGroup.serialize()));
	} else {
		const hashtags = JSON.parse(hashtagString);
		if (!containsHashtag(questionGroup.getHashtag())) {
			hashtags.push(questionGroup.getHashtag());
			localStorage.setItem("hashtags", JSON.stringify(hashtags));
		}
		localStorage.setItem(questionGroup.getHashtag(), JSON.stringify(questionGroup.serialize()));
	}
}

export function addQuestion(questionItem) {
	if (!(questionItem instanceof AbstractQuestion)) {
		return;
	}
	const sessionDataString = localStorage.getItem(questionItem.getHashtag());
	if (sessionDataString) {
		const sessionData = JSON.parse(sessionDataString);
		if (questionItem.getQuestionIndex() < sessionData.questionList.length) {
			sessionData.questionList[questionItem.getQuestionIndex()].questionText = questionItem.getQuestionText();
		} else {
			sessionData.questionList.push(questionItem.serialize());
		}
		localStorage.setItem(questionItem.getHashtag(), JSON.stringify(sessionData));
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

export function reenterSession(hashtag) {
	if (!hashtag || hashtag === "hashtags" || hashtag === "privateKey") {
		throw new TypeError("Undefined or illegal hashtag provided");
	}

	const hashtagString = localStorage.getItem("hashtags");
	const hashtags = JSON.parse(hashtagString);
	$.each(hashtags, function (i, hashtagElement) {
		if (hashtag.toLowerCase() === hashtagElement.toLowerCase()) {
			hashtag = hashtagElement;
		}
	});

	const sessionDataString = localStorage.getItem(hashtag);
	if (!sessionDataString) {
		throw new TypeError("Undefined session data");
	}

	const sessionData = JSON.parse(sessionDataString);
	if (typeof sessionData !== "object") {
		throw new TypeError("Illegal session data");
	}
	if (sessionData.type === "DefaultQuestionGroup") {
		return new DefaultQuestionGroup(sessionData);
	} else {
		throw new TypeError("Undefined session type while reentering");
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

export function initializePrivateKey() {
	if (!localStorage.getItem("privateKey")) {
		localStorage.setItem("privateKey", new Mongo.ObjectID()._str);
	}
}

export function getPrivateKey() {
	return localStorage.getItem("privateKey");
}

export function exportFromLocalStorage(hashtag) {
	const localStorageData = JSON.parse(localStorage.getItem(hashtag));
	if (!localStorageData) {
		throw new TypeError("Invalid local storage data while exporting");
	}

	if (localStorageData.type == "DefaultQuestionGroup") {
		return JSON.stringify(new DefaultQuestionGroup(localStorageData).serialize());
	} else {
		throw new TypeError("Undefined session type while exporting");
	}
}
