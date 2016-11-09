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
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import * as localData from '/lib/local_storage.js';
import * as headerLib from "/client/layout/region_header/lib.js";
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as lib from './lib.js';

Template.liveResults.onRendered(()=> {
	const eventDoc = EventManagerCollection.findOne();
	const sessionConfig = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
	const isOwner = localData.containsHashtag(Router.current().params.quizName);
	const questionCount = QuestionGroupCollection.findOne().questionList.length;

	if (eventDoc.questionIndex < questionCount) {
		if (isOwner) {
			if (sessionConfig.readingConfirmationEnabled) {
				Meteor.call("EventManagerCollection.showReadConfirmedForIndex", Router.current().params.quizName, 0);
			}
		}
		lib.startCountdown(eventDoc.questionIndex);
	}

	footerElements.removeFooterElements();
	if (isOwner) {
		footerElements.addFooterElement(footerElements.footerElemHome);
		footerElements.addFooterElement(footerElements.footerElemSound);
		if (eventDoc.questionIndex + 1 < questionCount) {
			footerElements.addFooterElement(footerElements.footerElemReadingConfirmation);
		}
		if (navigator.userAgent.match(/iPad/i) == null) {
			footerElements.addFooterElement(footerElements.footerElemFullscreen);
		}
	}
});

Template.liveResultsTitle.onRendered(function () {
	let countdownActive = Session.get("countdownInitialized");
	this.autorun(function () {
		const tmpCountdownActive = Session.get("countdownInitialized");
		if (countdownActive !== tmpCountdownActive) {
			countdownActive = tmpCountdownActive;
			lib.liveResultsTracker.changed();
		}
	}.bind(this));
	lib.liveResultsTracker.changed();
});
