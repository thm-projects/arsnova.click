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
import {MemberListCollection} from '/lib/member_list/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import * as localData from '/lib/local_storage.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as lib from './lib.js';

Template.liveResults.onRendered(()=> {
	const eventDoc = EventManagerCollection.findOne();
	const hashtag = Router.current().params.quizName;
	const sessionConfig = SessionConfigurationCollection.findOne({hashtag: hashtag});
	const isOwner = localData.containsHashtag(Router.current().params.quizName);
	const questionCount = QuestionGroupCollection.findOne().questionList.length;

	if (eventDoc.questionIndex < questionCount) {
		if (sessionConfig.readingConfirmationEnabled && eventDoc.readingConfirmationIndex === 0 && eventDoc.questionIndex === -1) {
			if (isOwner) {
				Meteor.call("EventManagerCollection.showReadConfirmedForIndex", hashtag, 0);
			}
		} else {
			let allMemberResponses = ResponsesCollection.find({questionIndex: eventDoc.questionIndex}).fetch();
			let memberWithGivenResponsesAmount = _.uniq(allMemberResponses, false, function (user) {
				return user.userNick;
			}).length;
			let memberAmount = MemberListCollection.find().fetch().length;
			if (memberWithGivenResponsesAmount < memberAmount) {
				lib.startCountdown(eventDoc.questionIndex);
			}
		}
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
	lib.calculateButtonCount();
	lib.liveResultsTracker.changed();
});

Template.liveResultsTitle.onRendered(function () {
	let init = Session.get("countdownInitialized");
	this.autorun(function () {
		const tmpInit = Session.get("countdownInitialized");
		if (init !== tmpInit) {
			lib.liveResultsTracker.changed();
			footerElements.footerTracker.changed();
			init = tmpInit;
		}
	}.bind(this));
	lib.liveResultsTracker.changed();
	footerElements.footerTracker.changed();
});
