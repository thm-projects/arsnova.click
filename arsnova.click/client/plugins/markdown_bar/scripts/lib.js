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

import {Session} from 'meteor/session';
import {Router} from 'meteor/iron:router';
import * as localData from '/lib/local_storage.js';

export const urlSchema = {
	type: String,
	min: 1,
	max: 2048
};

export function insertInQuestionText(textStart, textEnd) {
	textEnd = typeof textEnd !== 'undefined' ? textEnd : '';
	let textarea = document.getElementById('questionText');

	let scrollPos = textarea.scrollTop;

	let strPosBegin = textarea.selectionStart;
	let strPosEnd = textarea.selectionEnd;

	let frontText = (textarea.value).substring(0, strPosBegin);
	let backText = (textarea.value).substring(strPosEnd, textarea.value.length);
	let selectedText = (textarea.value).substring(strPosBegin, strPosEnd);

	textarea.value = frontText + textStart + selectedText + textEnd + backText;

	textarea.selectionStart = strPosBegin + textStart.length;
	textarea.selectionEnd = strPosEnd + textStart.length;
	textarea.focus();

	textarea.scrollTop = scrollPos;
	const questionText = textarea.value;
	const questionItem = Session.get("questionGroup");
	questionItem.getQuestionList()[Router.current().params.questionIndex].setQuestionText(questionText);
	Session.set("questionGroup", questionItem);
	localData.addHashtag(questionItem);
}

export function markdownAlreadyExistsAndAutoRemove(textStart, textEnd) {
	let textarea = document.getElementById('questionText');

	// fix for IE / Edge: get dismissed focus back to retrieve selection values
	textarea.focus();

	let scrollPos = textarea.scrollTop;
	let strPosBegin = textarea.selectionStart;
	let strPosEnd = textarea.selectionEnd;

	textEnd = typeof textEnd !== 'undefined' ? textEnd : '';
	let textEndExists = false;
	let textStartExists = false;

	if (textEnd.length > 0) {
		if ((textarea.value).substring(strPosEnd, strPosEnd + textEnd.length) == textEnd) {
			textEndExists = true;
		}
	} else {
		textEndExists = true;
	}

	if ((textarea.value).substring(strPosBegin - textStart.length, strPosBegin) == textStart) {
		textStartExists = true;
	}

	if (textStartExists && textEndExists) {
		let frontText = (textarea.value).substring(0, strPosBegin - textStart.length);
		let middleText = (textarea.value).substring(strPosBegin, strPosEnd);
		let backText = (textarea.value).substring(strPosEnd + textEnd.length, textarea.value.length);
		textarea.value = frontText + middleText + backText;
		textarea.selectionStart = strPosBegin - textStart.length;
		textarea.selectionEnd = strPosEnd - (textEnd.length === 0 ? textStart.length : textEnd.length);
		textarea.focus();

		textarea.scrollTop = scrollPos;

		const questionText = textarea.value;
		const questionItem = Session.get("questionGroup");
		questionItem.getQuestionList()[Router.current().params.questionIndex].setQuestionText(questionText);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(questionItem);

		return true;
	}

	return false;
}
