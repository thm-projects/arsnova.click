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
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {QuestionGroupCollection} from "/lib/questions/collection.js";
import {DefaultQuestionGroup} from "/lib/questions/questiongroup_default.js";
import {startCountdown} from './lib.js';

Template.votingview.onCreated(function () {
	const index = typeof Router.current().params.questionIndex === "undefined" ? EventManagerCollection.findOne().questionIndex : parseInt(Router.current().params.questionIndex);
	Session.set("sessionClosed",undefined);
	Session.set("hasSendResponse", false);
	Session.set("hasToggledResponse", false);
	Session.set("countdownInitialized", false);
	if (!Session.get("questionGroup")) {
		Session.set("questionGroup", new DefaultQuestionGroup($.extend({isClient: true}, QuestionGroupCollection.findOne({hashtag: Router.current().params.quizName}))));
	}
	const questionItem = Session.get("questionGroup").getQuestionList()[index];
	const sessionType = questionItem.typeName();
	const answers = questionItem.getAnswerOptionList();
	const redirectOnAnswerClick = $.inArray(sessionType, ["SingleChoiceQuestion", "YesNoSingleChoiceQuestion", "TrueFalseSingleChoiceQuestion"]) > -1 ||
		(sessionType === "SurveyQuestion" && questionItem.getMultipleSelectionEnabled());
	Session.set("questionSC", redirectOnAnswerClick);
	Session.set("responses",JSON.stringify(new Array(answers.length).fill(false)));
	if (!(this.data && this.data["data-questionIndex"])) {
		startCountdown(index);
	}
});
