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
import * as localData from '/lib/local_storage.js';

export const markdownRenderingTracker = new Tracker.Dependency();

export function addQuestion(index) {
	const questionText = $('#questionText').val() || "";
	const questionItem = Session.get("questionGroup");
	if (!Session.get("questionGroup")) {
		return;
	}
	questionItem.getQuestionList()[index].setQuestionText(questionText);
	Session.set("questionGroup", questionItem);
	localData.addHashtag(questionItem);
}

export function parseCodeBlock(result, i) {
	let tmpNewItem = result[i] + "\n";
	let mergeEndIndex = result.length;
	for (let j = i + 1; j < result.length; j++) {
		tmpNewItem += result[j] + "\n";
		if (/^```/.test(result[j])) {
			mergeEndIndex = j;
			break;
		}
	}
	result.splice(i, mergeEndIndex - i + 1);
	result.splice(i, 0, tmpNewItem);
}

export function parseOrderedList(result, i) {
	let tmpNewItem = result[i] + "\n";
	let mergeEndIndex = result.length;
	for (let j = i + 1; j < result.length; j++) {
		if (!/^[0-9]*./.test(result[j])) {
			mergeEndIndex = j - 1;
			break;
		}
		tmpNewItem += result[j] + "\n";
	}
	result.splice(i, mergeEndIndex - i + 1);
	result.splice(i, 0, tmpNewItem);
}

export function parseUnorderedList(result, i) {
	let tmpNewItem = result[i] + "\n";
	let mergeEndIndex = result.length;
	for (let j = i + 1; j < result.length; j++) {
		if (!/^(   )[*-] /.test(result[j]) && !/^[0-9]*./.test(result[j])) {
			mergeEndIndex = j - 1;
			break;
		}
		tmpNewItem += result[j] + "\n";
	}
	result.splice(i, mergeEndIndex - i + 1);
	result.splice(i, 0, tmpNewItem);
}

export function parseCommentBlock(result, i) {
	let tmpNewItem = result[i] + "\n";
	let mergeEndIndex = result.length;
	for (let j = i + 1; j < result.length; j++) {
		if (!/^> /.test(result[j])) {
			mergeEndIndex = j - 1;
			break;
		}
		tmpNewItem += result[j] + "\n";
	}
	result.splice(i, mergeEndIndex - i + 1);
	result.splice(i, 0, tmpNewItem);
}

export function parseLinkBlock(result, i) {
	const startIndex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/.exec(result[i]);
	const linkStr = startIndex[0] || result[i];
	const link = !/^https?:\/\//.test(linkStr) ? "http://" + linkStr : linkStr;
	const prevLinkContent = result[i].substring(0, startIndex.index);
	const postLinkContent = result[i].indexOf(" ", startIndex.index) > -1 ? result[i].substring(result[i].indexOf(" ", startIndex.index)) : "";
	result[i] = prevLinkContent + "<a href='" + link + "' target='_blank'>" + linkStr + "</a>" + postLinkContent;
}

export function parseTableBlock(result, i) {
	let tmpNewItem = result[i] + "\n";
	let mergeEndIndex = result.length;
	for (let j = i + 1; j < result.length; j++) {
		if (!/\s\|\s/.test(result[j])) {
			mergeEndIndex = j - 1;
			break;
		}
		tmpNewItem += (result[j] + "\n");
	}
	const tmpNewItemElement = $("<table><thead></thead><tbody></tbody></table>");
	let tableHasHeader = /[-]+\s\|\s[-]+/.test(tmpNewItem);
	tmpNewItem.split(/\s\|\s/).forEach(function (element) {
		if (element === "") {
			return;
		}
		const isLastElementInRow = /^.*\n.*$/.test(element);
		if (isLastElementInRow) {
			element = element.split(/\n/);
		} else {
			element = [element];
		}
		element.forEach(function (elementPart) {
			if (elementPart.length === 0) {
				return;
			}
			if (/[-]+/.test(elementPart)) {
				tableHasHeader = false;
			} else {
				if (tableHasHeader) {
					tmpNewItemElement.find("thead").append($("<th/>").text(elementPart));
				} else {
					if (element.slice(-1)[0] === elementPart && element.length > 1) {
						tmpNewItemElement.find("tbody").append($("<tr/>"));
					}
					tmpNewItemElement.find("tbody").find("tr").last().append($("<td/>").text(elementPart));
				}
			}
		});
	});
	result.splice(i, mergeEndIndex - i + 1);
	result.splice(i, 0, tmpNewItemElement.prop('outerHTML'));
}

export function parseEmojiBlock(result, i) {
	const wrapper = $("<div class='emojiWrapper'/>");
	let lastIndex = 0;
	result[i].match(/:([a-z0-9_\+\-]+):/g).forEach(function (emoji) {
		const emojiPlain = emoji.replace(/:/g, "");
		wrapper.append("<span>" + result[i].substring(lastIndex, result[i].indexOf(emoji)) + "</span>");
		lastIndex = result[i].indexOf(emoji) + emoji.length;
		wrapper.append("<img class='emojiImage' src='/images/emojis/" + emojiPlain + ".png' alt='" + emojiPlain + ".png' />");
	});
	wrapper.append("<span>" + result[i].substring(lastIndex, result[i].length) + "</span>");
	result[i] = wrapper.prop("outerHTML");
}

export function parseMathjaxBlock(result, i) {
	let tmpNewItem = result[i] + "\n";
	let mergeEndIndex = result.length;
	for (let j = i + 1; j < result.length; j++) {
		if (/^(\$){2}$/.test(result[j])) {
			mergeEndIndex = j;
			break;
		}
		tmpNewItem += (result[j] + "\n");
	}
	result.splice(i, mergeEndIndex - i + 1);
	result.splice(i, 0, $("<div/>").append((tmpNewItem + "$$")).prop("outerHTML"));
}

export function parseStrikeThroughBlock(result, i) {
	result[i].match(/~~[^~{2}]*~~/gi).forEach(function (element) {
		result[i] = result[i].replace(element, "<del>" + element.replace(/~~/g, "") + "</del>");
	});
}

export function parseGithubFlavoredMarkdown(result) {
	for (let i = 0; i < result.length; i++) {
		switch (true) {
			case /^(\$){2}$/.test(result[i]):
				parseMathjaxBlock(result, i);
				break;
			case /^[\$]+/.test(result[i]):
				break;
			case /^```/.test(result[i]):
				parseCodeBlock(result, i);
				break;
			case /^([0-9]*\.)?(-)?(\*)? \[x\] /.test(result[i]):
				result[i] = ("<input class='markdownCheckbox' type='checkbox' checked='checked' disabled='disabled' />" + result[i].replace(/([0-9]*\.)?(-)?(\*)? \[x\] /, ""));
				break;
			case /^([0-9]*\.)?(-)?(\*)? \[ \] /.test(result[i]):
				result[i] = ("<input class='markdownCheckbox' type='checkbox' disabled='disabled' />" + result[i].replace(/^([0-9]*\.)?(-)?(\*)? \[ \] /, ""));
				break;
			case /^[\s]*1\./.test(result[i]):
				parseOrderedList(result, i);
				break;
			case /^[*-] /.test(result[i]):
				parseUnorderedList(result, i);
				break;
			case /^> /.test(result[i]):
				parseCommentBlock(result, i);
				break;
			case /~~.*~~/.test(result[i]):
				parseStrikeThroughBlock(result, i);
				break;
			case !/(^!)?\[.*\]\(.*\)/.test(result[i]) && /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/.test(result[i]) && !(/youtube/.test(result[i]) || /youtu.be/.test(result[i]) || /vimeo/.test(result[i])):
				parseLinkBlock(result, i);
				break;
			case result[i].length === 0:
				result.splice(i, 0, "<br/>");
				i++;
				break;
			case /\s\|\s/.test(result[i]):
				parseTableBlock(result, i);
				break;
			case /:[^\s]*:/.test(result[i]) && /:([a-z0-9_\+\-]+):/g.test(result[i]):
				parseEmojiBlock(result, i);
				break;
		}
	}
	markdownRenderingTracker.changed();
}

export function getQuestionTypes() {
	return [
		{
			id: "SingleChoiceQuestion",
			translationName: "view.questions.single_choice_question"
		},
		{
			id: "YesNoSingleChoiceQuestion",
			translationName: "view.questions.single_choice_question_yes_no"
		},
		{
			id: "TrueFalseSingleChoiceQuestion",
			translationName: "view.questions.single_choice_question_true_false"
		},
		{
			id: "MultipleChoiceQuestion",
			translationName: "view.questions.multiple_choice_question"
		},
		{
			id: "RangedQuestion",
			translationName: "view.questions.ranged_question"
		},
		{
			id: "FreeTextQuestion",
			translationName: "view.questions.free_text_question"
		},
		{
			id: "SurveyQuestion",
			translationName: "view.questions.survey_question"
		}
	];
}
