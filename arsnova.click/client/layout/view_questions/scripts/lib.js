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

export function addQuestion(index) {
	const questionText = $('#questionText').val() || "";
	const questionItem = Session.get("questionGroup");
	questionItem.getQuestionList()[index].setQuestionText(questionText);
	Session.set("questionGroup", questionItem);
	localData.addHashtag(questionItem);
}

export function checkForValidQuestionText() {
	const questionTextWithoutMarkdownChars = Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getQuestionTextWithoutMarkdownChars();

	if (questionTextWithoutMarkdownChars > 4 && questionTextWithoutMarkdownChars < 50001) {
		$('#questionText').removeClass("invalidQuestion");
	} else {
		$('#questionText').addClass("invalidQuestion");
	}
}

export function parseCodeBlock(result, i) {
	let tmpNewItem = result[i] + "\n";
	let mergeEndIndex = result.length;
	for (let j = i + 1; j < result.length; j++) {
		tmpNewItem += result[j] + "\n";
		if (result[j].startsWith("```")) {
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
	const startIndex = /(([A-Za-z]{3,9}):\/\/)?([-;:&=\+\$,\w]+@{1})?(([-A-Za-z0-9]+\.)+[A-Za-z]{2,3})(:\d+)?((\/[-\+~%/\.\w]+)?\/?([&?][-\+=&;%@\.\w]+)?(#[\w]+)?)?/g.exec(result[i]);
	const linkStr = startIndex[0] || result[i];
	const prevLinkContent = result[i].substring(0, startIndex.index);
	const postLinkContent = result[i].indexOf(" ", startIndex.index) > -1 ? result[i].substring(result[i].indexOf(" ", startIndex.index)) : "";
	result[i] = prevLinkContent + "<a href='" + linkStr + "'>" + linkStr + "</a>" + postLinkContent;
}

export function parseTableBlock(result, i) {
	let tmpNewItem = result[i];
	let mergeEndIndex = result.length;
	for (let j = i + 1; j < result.length; j++) {
		if (result[j].indexOf(" | ") === -1 && !/:[-]*:/.test(result[j])) {
			mergeEndIndex = j - 1;
			break;
		}
		tmpNewItem += (result[j] + "\n");
	}
	const tmpNewItemElement = $("<table><thead></thead><tbody></tbody></table>");
	let tableHasHeader = /|:[-]*:/.test(tmpNewItem);
	tmpNewItem.split("|").forEach(function (element) {
		if (element === "") {
			return;
		}
		if (element === "\n") {
			tmpNewItemElement.find("tbody").append($("<tr/>"));
			return;
		}
		if (tableHasHeader && /:[-]*:/.test(element)) {
			tableHasHeader = false;
		} else {
			if (tableHasHeader) {
				tmpNewItemElement.find("thead").append($("<th/>").text(element));
			} else {
				tmpNewItemElement.find("tbody").find("tr").last().append($("<td/>").text(element));
			}
		}
	});
	result.splice(i, mergeEndIndex - i + 1);
	result.splice(i, 0, tmpNewItemElement.prop('outerHTML'));
}

export function parseGithubFlavoredMarkdown(result) {
	for (let i = 0; i < result.length; i++) {
		switch (true) {
			case /^\$\$/.test(result[i]):
				break;
			case /```/.test(result[i]):
				parseCodeBlock(result, i);
				break;
			case /^([0-9]*\.)?(-)? \[x\] /.test(result[i]):
				result[i] = ("<input class='markdownCheckbox' type='checkbox' checked='checked' disabled='disabled' />" + result[i].replace(/([0-9]*\.)?(-)? \[x\] /, ""));
				break;
			case /^([0-9]*\.)?(-)? \[ \] /.test(result[i]):
				result[i] = ("<input class='markdownCheckbox' type='checkbox' disabled='disabled' />" + result[i].replace(/^([0-9]*\.)?(-)? \[ \] /, ""));
				break;
			case /1\./.test(result[i]):
				parseOrderedList(result, i);
				break;
			case /^[*-] /.test(result[i]):
				parseUnorderedList(result, i);
				break;
			case /^> /.test(result[i]):
				parseCommentBlock(result, i);
				break;
			case /~~.*~~/.test(result[i]):
				const index = /~~.*~~/.exec(result[i]);
				result[i] = result[i].replace(index[0], "<del>" + index[0].replace(/~/g, "") + "</del>");
				break;
			case !/\(.*:\/\/(.*.)*.*\)/.test(result[i]) && /.*:\/\/(.*.)*.*/.test(result[i]) && !(/youtube/.test(result[i]) || /youtu.be/.test(result[i]) || /vimeo/.test(result[i])):
				parseLinkBlock(result, i);
				break;
			case result[i] === "":
				result.splice(i, 0, "<br/>");
				i++;
				break;
			case result[i].indexOf(" | ") > -1:
				parseTableBlock(result, i);
				break;
		}
	}
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
