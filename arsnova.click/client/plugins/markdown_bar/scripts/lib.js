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
import {Tracker} from 'meteor/tracker';
import {Router} from 'meteor/iron:router';
import * as localData from '/lib/local_storage.js';

export const markdownBarTracker = new Tracker.Dependency();

export const urlSchema = {
	type: String,
	min: 1,
	max: 2048
};

export function insertInQuestionText(textStart, textEnd) {
	textEnd = typeof textEnd !== 'undefined' ? textEnd : '';
	const textarea = document.getElementById('questionText');

	const scrollPos = textarea.scrollTop;
	const strPosBegin = textarea.selectionStart;
	const strPosEnd = textarea.selectionEnd;
	const frontText = (textarea.value).substring(0, strPosBegin);
	const backText = (textarea.value).substring(strPosEnd, textarea.value.length);
	const selectedText = (textarea.value).substring(strPosBegin, strPosEnd);

	textarea.value = frontText + textStart + selectedText + textEnd + backText;
	textarea.selectionStart = strPosBegin + textStart.length;
	textarea.selectionEnd = strPosEnd + textStart.length;
	textarea.focus();
	textarea.scrollTop = scrollPos;
	markdownBarTracker.changed();
}

export function markdownAlreadyExistsAndAutoRemove(textStart, textEnd) {
	const textarea = document.getElementById('questionText');

	// fix for IE / Edge: get dismissed focus back to retrieve selection values
	textarea.focus();

	const scrollPos = textarea.scrollTop;
	const strPosBegin = textarea.selectionStart;
	const strPosEnd = textarea.selectionEnd;

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

	markdownBarTracker.changed();
	if (textStartExists && textEndExists) {
		const frontText = (textarea.value).substring(0, strPosBegin - textStart.length);
		const middleText = (textarea.value).substring(strPosBegin, strPosEnd);
		const backText = (textarea.value).substring(strPosEnd + textEnd.length, textarea.value.length);

		textarea.value = frontText + middleText + backText;
		textarea.selectionStart = strPosBegin - textStart.length;
		textarea.selectionEnd = strPosEnd - (textEnd.length === 0 ? textStart.length : textEnd.length);
		textarea.focus();
		textarea.scrollTop = scrollPos;

		return true;
	}
	return false;
}
