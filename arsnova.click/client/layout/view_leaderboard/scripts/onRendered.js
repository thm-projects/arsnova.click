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
import * as localData from '/lib/local_storage.js';
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {calculateButtonCount, leaderboardTracker} from './lib.js';

Template.leaderBoard.onRendered(function () {
	footerElements.removeFooterElements();
	if (localData.containsHashtag(Router.current().params.quizName)) {
		footerElements.addFooterElement(footerElements.footerElemHome);
		footerElements.addFooterElement(footerElements.footerElemSound);
		if (navigator.userAgent.match(/iPad/i) == null) {
			footerElements.addFooterElement(footerElements.footerElemFullscreen);
		}
	}

	$(window).resize(function () {
		if (Session.get("responsesCountOverride") && (Session.get("allMembersCount") - Session.get("maxResponseButtons") === 0)) {
			Session.set("responsesCountOverride", false);
		}
	});

	this.autorun(function () {
		headerLib.titelTracker.depend();
		calculateButtonCount(Session.get("allMembersCount"));
	}.bind(this));
	footerElements.footerTracker.changed();
	leaderboardTracker.changed();
});

Template.liveResultsTitle.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.footerTracker.changed();
	leaderboardTracker.changed();
});
