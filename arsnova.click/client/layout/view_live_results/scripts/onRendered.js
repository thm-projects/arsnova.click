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
import {ResponsesCollection} from '/lib/responses/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {showReadingConfirmationSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';
import {calculateHeaderSize} from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {calculateButtonCount, startCountdown} from './lib.js';

Template.liveResults.onRendered(()=> {
	if (EventManagerCollection.findOne().readingConfirmationIndex < 1 && EventManagerCollection.findOne().questionIndex < 0) {
		showReadingConfirmationSplashscreen(0);
	}
	if (localData.containsHashtag(Router.current().params.quizName) && EventManagerCollection.findOne() && EventManagerCollection.findOne().readingConfirmationIndex === -1) {
		Meteor.call("EventManagerCollection.showReadConfirmedForIndex", Router.current().params.quizName, 0);
	}

	footerElements.removeFooterElements();
	if (localData.containsHashtag(Router.current().params.quizName)) {
		footerElements.addFooterElement(footerElements.footerElemHome);
		footerElements.addFooterElement(footerElements.footerElemSound);
		/*
		Not yet implemented!
		if (EventManagerCollection.findOne().readingConfirmationIndex < QuestionGroupCollection.findOne().questionList.length) {
			footerElements.addFooterElement(footerElements.footerElemReadingConfirmation);
		}
		*/
		footerElements.addFooterElement(footerElements.footerElemFullscreen);
		footerElements.calculateFooter();
	} else {
		let allMemberResponses = ResponsesCollection.find({questionIndex: EventManagerCollection.findOne().questionIndex}).fetch();
		let memberWithGivenResponsesAmount = _.uniq(allMemberResponses, false, function (user) {
			return user.userNick;
		}).length;
		let memberAmount = MemberListCollection.find().fetch().length;
		if (memberWithGivenResponsesAmount !== memberAmount) {
			startCountdown(EventManagerCollection.findOne().questionIndex);
		}
	}

	calculateButtonCount();
	Session.set("LearnerCountOverride", false);
	calculateHeaderSize();
	$(window).resize(function () {
		calculateButtonCount();
		Session.set("LearnerCountOverride", false);
		calculateHeaderSize();
	});
});

Template.readingConfirmedLearner.onRendered(function () {
	calculateButtonCount();
});
