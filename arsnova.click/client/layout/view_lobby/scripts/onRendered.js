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
import {MemberListCollection} from '/lib/member_list/collection.js';
import * as localData from '/lib/local_storage.js';
import {calculateHeaderSize} from '/client/layout/region_header/lib.js';
import {lobbySound, setLobbySound} from '/client/plugins/sound/scripts/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {calculateButtonCount} from './lib.js';

Template.memberlist.onRendered(function () {
	Session.set("learnerCountOverride", false);
	Session.set("allMembersCount", MemberListCollection.find().count());
	Session.set("lobbySoundIsPlaying", true);
	setLobbySound("LobbySong1");
	lobbySound.play();
	calculateButtonCount(MemberListCollection.find().count());
	$('.header-title').text(Router.current().params.quizName);
	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);

	footerElements.removeFooterElements();
	if (localData.containsHashtag(Router.current().params.quizName)) {
		footerElements.addFooterElement(footerElements.footerElemHome);
		footerElements.addFooterElement(footerElements.footerElemQRCode);
		footerElements.addFooterElement(footerElements.footerElemSound);
		/*
		 Not yet implemented!
		footerElements.addFooterElement(footerElements.footerElemReadingConfirmation);
		*/
		footerElements.addFooterElement(footerElements.footerElemNicknames);
		if (navigator.userAgent.match(/iPad/i) == null) {
			footerElements.addFooterElement(footerElements.footerElemFullscreen);
		}
		footerElements.addFooterElement(footerElements.footerElemTheme);
	}
	footerElements.calculateFooter();
});

Template.learner.onRendered(function () {
	calculateButtonCount(MemberListCollection.find().count());
});
