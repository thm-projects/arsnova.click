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
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import * as localData from '/client/lib/local_storage.js';

let hasError = false;
const updateAnswerText = function (error, result) {
	hasError = error;
	if (!error) {
		localData.updateAnswerText(result);
	}
};

export var subscriptionHandler = null;

export function parseAnswerOptionInput(index) {
	for (var i = 0; i < AnswerOptionCollection.find({questionIndex: index}).count(); i++) {
		var text = $("#answerOptionText_Number" + i).val();
		var isCorrect = $('div#answerOption-' + i + ' .check-mark-checked').length > 0 ? 1 : 0;
		var answer = {
			privateKey: localData.getPrivateKey(),
			hashtag: Session.get("hashtag"),
			questionIndex: index,
			answerOptionNumber: i,
			answerText: text,
			isCorrect: isCorrect
		};
		Meteor.call('AnswerOptionCollection.updateAnswerTextAndIsCorrect', answer, updateAnswerText);
	}
	return hasError;
}
