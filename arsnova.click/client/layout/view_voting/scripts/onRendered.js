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
import {Template} from 'meteor/templating';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as headerLib from '/client/layout/region_header/lib.js';
import * as answerOptionLib from '/client/layout/view_answeroptions/scripts/lib.js';
import * as questionLib from '/client/layout/view_questions/scripts/lib.js';
import * as lib from './lib.js';

Template.votingview.onRendered(function () {
	let questionType = "";
	if (this.data && this.data["data-questionIndex"]) {
		Session.set("previewQuestionIndex", parseInt(this.data["data-questionIndex"]));
		questionType = Session.get("questionGroup").getQuestionList()[this.data["data-questionIndex"]].typeName();
	} else {
		questionType = QuestionGroupCollection.findOne().questionList[EventManagerCollection.findOne().questionIndex].type;
	}
	footerElements.removeFooterElements();
	footerElements.footerTracker.changed();
	if (questionType !== "RangedQuestion" && questionType !== "FreeTextQuestion") {
		this.autorun(function () {
			headerLib.titelTracker.depend();
			answerOptionLib.answerOptionTracker.depend();
			questionLib.markdownRenderingTracker.depend();
			Meteor.defer(function () {
				lib.formatAnswerButtons();
				lib.quickfitText();
			});
		}.bind(this));
	}
	lib.votingViewTracker.changed();
	Meteor.defer(function () {
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	});
});

Template.liveResultsTitle.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.footerTracker.changed();
	lib.votingViewTracker.changed();
	Meteor.defer(function () {
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	});
});
