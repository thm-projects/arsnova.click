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
import * as localData from '/lib/local_storage.js';

export var subscriptionHandler = null;

export function parseAnswerOptionInput(index) {
	const questionItem = Session.get("questionGroup");
	const answerlist = questionItem.getQuestionList()[index].getAnswerOptionList();

	for (var i = 0; i < answerlist.length; i++) {
		answerlist[i].setAnswerText($("#answerOptionText_Number" + i).val());
		answerlist[i].setIsCorrect($('#answerOption-' + i).find(".check-mark-checked").length > 0);
	}
	Session.set("questionGroup", questionItem);
	localData.addHashtag(Session.get("questionGroup"));
}

export function parseSingleAnswerOptionInput(questionIndex, answerOptionIndex) {
	const questionItem = Session.get("questionGroup");
	const answerlist = questionItem.getQuestionList()[questionIndex].getAnswerOptionList();
	answerlist[answerOptionIndex].setAnswerText($("#answerOptionText_Number" + questionIndex).val());
	Session.set("questionGroup", questionItem);
	localData.addHashtag(Session.get("questionGroup"));
}
