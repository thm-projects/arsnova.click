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
import {lobbySound} from '/client/plugins/sound/scripts/lib.js';
import {memberlistObserver} from './lib.js';
import {Router} from 'meteor/iron:router';
import  * as localData from '/lib/local_storage.js';
import {TimerMap} from "/lib/performance_analysis/Timer.js";

Template.memberlist.onDestroyed(function () {
	if (!localData.containsHashtag(Router.current().params.quizName)) {
		TimerMap.routeToVotingView.start();
	}
	if (memberlistObserver) {
		memberlistObserver.stop();
	}
	if (lobbySound !== null) {
		Session.set("lobbySoundIsPlaying", false);
		lobbySound.stop();
	}
	$('.qr-code-container').hide();
	Session.delete("allMembersCount");
	Session.delete("maxLearnerButtons");
	Session.delete("learnerCountOverride");

	$('.navbar-footer-placeholder').hide();
	$('.navbar-footer').show();
});
