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
import * as hashtagLib from '/client/layout/view_hashtag_management/scripts/lib.js';
import * as localData from '/lib/local_storage.js';

Template.showHashtagsSplashscreen.events({
	"click .js-my-hash": function (event) {
		Session.set("questionGroup", localData.reenterSession($(event.currentTarget).text()));
		hashtagLib.hashtagSplashscreen.destroy();
		if (Session.get("questionGroup").isValid()) {
			sessionStorage.setItem("overrideValidQuestionRedirect", true);
		}
		hashtagLib.addHashtag(Session.get("questionGroup"));
	},
	"click #js-btn-showHashtagManagement": function () {
		hashtagLib.hashtagSplashscreen.destroy();
		Router.go("/hashtagmanagement");
	},
	"click #closeButton": function () {
		$('.showHashtagsSplashscreen').remove();
		$('.modal-backdrop').remove();
	}
});
