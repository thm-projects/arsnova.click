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
export let eventManagerCollectionObserver = null;

export function setHashtagSplashscreen(instance) {
	hashtagSplashscreen = instance;
}

export function setEventManagerHandle(handle) {
	eventManagerHandle = handle;
}

export function setEventManagerTracker(handle) {
	eventManagerTracker = handle;
}

export function setEventManagerCollectionObserver(handle) {
	eventManagerCollectionObserver = handle;
}

export function findOriginalHashtag(inputHashtag) {
	const loweredHashtag = inputHashtag.toLowerCase();
	let result = "";
	if (loweredHashtag === "demo quiz") {
		return inputHashtag;
	}
	const allHashtags = HashtagsCollection.find().fetch();
	$.each(allHashtags, function (i, originalHashtag) {
		if (originalHashtag.hashtag.toLowerCase() === loweredHashtag) {
			result = originalHashtag.hashtag;
			return false;
		}
	});
	return result;
}

export function getNewDemoQuizName() {
	let largestIndex = 0;
	const hashtags = HashtagsCollection.find({hashtag: {$regex: "demo quiz *", $options: 'i'}}).fetch();
	hashtags.every(function (item) {
		const tmpIndex = parseInt(item.hashtag.split(" ")[2]);
		if (tmpIndex > largestIndex) {
			largestIndex = tmpIndex;
		}
		return true;
	});
	return "Demo Quiz " + (largestIndex + 1);
}

export function connectEventManager(hashtag) {
	const connect = function (hashtag) {
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
			if (sessionStorage.getItem("overrideValidQuestionRedirect")) {
				if (Session.get("questionGroup").isValid() || Session.get("questionGroup").getHashtag().toLowerCase().indexOf("demo quiz") !== -1) {
					Meteor.call("MemberListCollection.removeFromSession", hashtag);
					Meteor.call("EventManagerCollection.setActiveQuestion", hashtag, 0);
					Meteor.call("EventManagerCollection.setSessionStatus", hashtag, 2);
					Meteor.call('SessionConfiguration.addConfig', Session.get("questionGroup").getConfiguration().serialize());
					Meteor.call("QuestionGroupCollection.persist", Session.get("questionGroup").serialize());
					Router.go("/" + hashtag + "/memberlist");
				} else {
					Router.go("/" + hashtag + "/question");
				}
			} else {
				Router.go("/" + hashtag + "/question");
			}
			sessionStorage.removeItem("overrideValidQuestionRedirect");
		});
	};
	if (Session.get("questionGroup").getConfiguration().getNickSettings().getRestrictToCASLogin()) {
		Meteor.loginWithCas(function () {
			connect(hashtag);
		});
	} else {
		connect(hashtag);
	}
}

export function addHashtag(questionGroup) {
	if (!HashtagsCollection.findOne({hashtag: questionGroup.getHashtag()})) {
		Meteor.call('SessionConfiguration.addConfig', questionGroup.getConfiguration().serialize());
		Meteor.call('HashtagsCollection.addHashtag', {
			privateKey: localData.getPrivateKey(),
			hashtag: questionGroup.getHashtag()
		}, function (err) {
			if (!err) {
				localData.addHashtag(questionGroup);
				Session.set("questionGroup", questionGroup);
				connectEventManager(questionGroup.getHashtag());
			}
		});
	} else {
		localData.addHashtag(questionGroup);
		Session.set("questionGroup", questionGroup);
		connectEventManager(questionGroup.getHashtag());
	}
}

export function trimIllegalChars(hashtag) {
	return hashtag.replace(/ /g,"");
}
