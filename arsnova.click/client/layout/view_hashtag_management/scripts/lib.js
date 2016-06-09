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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';

export let hashtagSplashscreen = null;
export let eventManagerHandle = null;
export let eventManagerTracker = null;

export function setHashtagSplashscreen(instance) {
	hashtagSplashscreen = instance;
}

export function setEventManagerHandle(handle) {
	eventManagerHandle = handle;
}

export function setEventManagerTracker(handle) {
	eventManagerTracker = handle;
}

export function connectEventManager(hashtag) {
	Meteor.subscribe("EventManagerCollection.join", hashtag, function () {
		if (!EventManagerCollection.findOne()) {
			Meteor.call('EventManagerCollection.add', hashtag, function (err) {
				if (err) {
					new ErrorSplashscreen({
						autostart: true,
						errorMessage: "plugins.splashscreen.error.error_messages." + err.reason
					});
					Router.go("/" + hashtag + "/resetToHome");
				}
			});
		} else {
			Meteor.call("EventManagerCollection.setActiveQuestion", hashtag, 0);
		}
		Router.go("/" + hashtag + "/question");
	});
}

export function trimIllegalChars(hashtag) {
	return hashtag.replace(/ /g,"");
}
