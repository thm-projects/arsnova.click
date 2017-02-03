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
import {Router} from 'meteor/iron:router';
import * as localData from '/lib/local_storage.js';

/* This will set an interval to tell the server that the quiz is still online.
 * Otherwise the server will remove the content data from it's database periodically
 * We need to call the Method once at the beginning to prevent any race conditions
 * with the timeout executing the keepalive method and the server's remove timeout.
 * This is called inside of the onRendered callback of the layout template in the global section.
 * This file content will be called always when loading the page. The if inside of the
 * interval callback is required because the interval is set already on the landing page
 * and will trigger always when using the app. TODO: Replace this with a Tracker.Dependency
*/
Meteor.setInterval(function () {
	if (localData.containsHashtag(Router.current().params.quizName)) {
		Meteor.call('keepalive', Router.current().params.quizName);
	}
}, 180000);
