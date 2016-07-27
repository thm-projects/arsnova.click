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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';

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

export function findOriginalHashtag(inputHashtag) {
	var loweredHashtag = inputHashtag.toLowerCase();
	var allHashtags = HashtagsCollection.find().fetch();
	var result = "";
	$.each(allHashtags, function (i, originalHashtag) {
		if (originalHashtag.hashtag.toLowerCase() === loweredHashtag) {
			result = originalHashtag.hashtag;
		}
	});
	return result;
}

export function getNewDemoQuizName() {
	const hashtags = HashtagsCollection.find({hashtag: {$regex: "demo quiz *", $options: 'i'}}).fetch();
	const newIndex = parseInt(hashtags[hashtags.length - 1].hashtag.split(" ")[2]) + 1;
	console.log(newIndex);
	return "Demo Quiz " + newIndex;
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

export function addHashtag(questionGroup) {
	Meteor.call('HashtagsCollection.addHashtag', {
		privateKey: localData.getPrivateKey(),
		hashtag: questionGroup.getHashtag(),
		musicVolume: questionGroup.getMusicVolume(),
		musicEnabled: questionGroup.getMusicEnabled(),
		musicTitle: questionGroup.getMusicTitle(),
		theme: questionGroup.getTheme(),
		selectedNicks: questionGroup.getSelectedNicks()
	}, function (err) {
		if (!err) {
			localData.addHashtag(questionGroup);
			Session.set("questionGroup", questionGroup);
			connectEventManager(questionGroup.getHashtag());
		}
	});
}

export function trimIllegalChars(hashtag) {
	return hashtag.replace(/ /g,"");
}
