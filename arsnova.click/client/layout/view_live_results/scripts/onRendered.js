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
import {showReadingConfirmationSplashscreen, ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';
import * as headerlib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {calculateButtonCount, startCountdown, liveResultsTracker} from './lib.js';

Template.liveResults.onRendered(()=> {
	if (EventManagerCollection.findOne().readingConfirmationIndex < 1 &&
		EventManagerCollection.findOne().questionIndex < 0 &&
		SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName}).readingConfirmationEnabled !== false) {
		showReadingConfirmationSplashscreen(0);
	}
	if (SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName}).readingConfirmationEnabled === false) {
		if (EventManagerCollection.findOne().readingConfirmationIndex < 1 &&
			EventManagerCollection.findOne().questionIndex < 0 &&
			localData.containsHashtag(Router.current().params.quizName)) {
			Meteor.call('Question.startTimer', {
				hashtag: Router.current().params.quizName,
				questionIndex: EventManagerCollection.findOne().questionIndex + 1
			}, (err) => {
				if (err) {
					new ErrorSplashscreen({
						autostart: true,
						errorMessage: "plugins.splashscreen.error.error_messages." + err.reason
					});
					Session.set("sessionClosed", true);
				} else {
					Session.set("sessionClosed", false);
					startCountdown(EventManagerCollection.findOne().questionIndex + 1);
				}
			});
		}
		$('#startNextQuestion').removeAttr("disabled");
	}
	if (localData.containsHashtag(Router.current().params.quizName) && EventManagerCollection.findOne() && EventManagerCollection.findOne().readingConfirmationIndex === -1) {
		Meteor.call("EventManagerCollection.showReadConfirmedForIndex", Router.current().params.quizName, 0);
	}

	footerElements.removeFooterElements();
	if (localData.containsHashtag(Router.current().params.quizName)) {
		footerElements.addFooterElement(footerElements.footerElemHome);
		footerElements.addFooterElement(footerElements.footerElemSound);
		if (EventManagerCollection.findOne().readingConfirmationIndex < QuestionGroupCollection.findOne().questionList.length) {
			footerElements.addFooterElement(footerElements.footerElemReadingConfirmation);
		}
		if (navigator.userAgent.match(/iPad/i) == null) {
			footerElements.addFooterElement(footerElements.footerElemFullscreen);
		}
		footerElements.calculateFooter();
	}

	calculateButtonCount();
	Session.set("LearnerCountOverride", false);
	headerlib.calculateHeaderSize();
	$(window).resize(function () {
		calculateButtonCount();
		Session.set("LearnerCountOverride", false);
		headerlib.calculateHeaderSize();
	});
});

Template.readingConfirmedLearner.onRendered(function () {
	calculateButtonCount();
});

Template.liveResultsTitle.onRendered(function () {
	let countdownActive = Session.get("countdownInitialized");
	this.autorun(function () {
		const tmpCountdownActive = Session.get("countdownInitialized");
		if (countdownActive !== tmpCountdownActive) {
			countdownActive = tmpCountdownActive;
			liveResultsTracker.changed();
		}
	});
	liveResultsTracker.changed();
});
