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
import {SubsManager} from 'meteor/meteorhacks:subs-manager';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import * as localData from '/lib/local_storage.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {globalEventStackObserver, setGlobalEventStackObserver} from '/client/plugins/event_stack_observer/scripts/lib.js';
import {getChangeEventsForRoute} from '/client/plugins/event_stack_observer/scripts/onChangeEvent.js';
import {getRemoveEventsForRoute} from '/client/plugins/event_stack_observer/scripts/onRemoveEvent.js';

const subsCache = new SubsManager({
	/* maximum number of cached subscriptions */
	cacheLimit: 8,
	/* any subscription will expire after 15 minutes, if it's not subscribed again */
	expireIn: 15
});

Router.configure({
	layoutTemplate: "layout",
	loadingTemplate: "loading",
	waitOn: function () {
		const subscriptions = [
			subsCache.subscribe('HashtagsCollection.public'),
			subsCache.subscribe('BannedNicksCollection.public')
		];
		if (typeof Router.current().params.quizName !== "undefined") {
			subscriptions.push(subsCache.subscribe('ResponsesCollection.join', Router.current().params.quizName));
			subscriptions.push(subsCache.subscribe('AnswerOptionCollection.join', Router.current().params.quizName));
			subscriptions.push(subsCache.subscribe('QuestionGroupCollection.join', Router.current().params.quizName));
			subscriptions.push(subsCache.subscribe('MemberListCollection.join', Router.current().params.quizName));
			subscriptions.push(subsCache.subscribe('LeaderBoardCollection.join', Router.current().params.quizName));
			subscriptions.push(subsCache.subscribe('EventManagerCollection.join', Router.current().params.quizName));
		} else {
			subscriptions.push(Meteor.subscribe("ConnectionStatusCollection.join"));
		}
		return subscriptions;
	}
});

Router.onStop(function () {
	var lastRoute = Router.current().route.getName();
	if (lastRoute === undefined) {
		//homeView
		localStorage.setItem("lastPage", "/");
	} else if (lastRoute !== "agb" && lastRoute !== "dataprivacy" && lastRoute !== "imprint") {
		localStorage.setItem("lastPage", lastRoute);
	}
});

Router.onBeforeAction(function () {
	try {
		localData.initializePrivateKey();
	} catch (ex) {
		new ErrorSplashscreen({
			autostart: true,
			errorMessage: "plugins.splashscreen.error.error_messages.private_browsing"
		});
	} finally {
		this.next();
	}
});

Router.onBeforeAction(function () {
	let theme = "theme-dark";
	if (!localStorage.getItem("theme")) {
		localStorage.setItem("theme", theme);
	} else {
		theme = localStorage.getItem("theme");
	}
	if (Router.current().params.quizName) {
		const hashtagDoc = HashtagsCollection.findOne({hashtag: Router.current().params.quizName});
		if (hashtagDoc && hashtagDoc.theme && !localData.containsHashtag(Router.current().params.quizName)) {
			sessionStorage.setItem("quizTheme", hashtagDoc.theme);
			theme = hashtagDoc.theme;
		}
	}
	Session.set("theme", theme);
	this.next();
});

Router.onBeforeAction(function () {
	if (!globalEventStackObserver) {
		setGlobalEventStackObserver();
	}
	if (typeof Router.current().params.quizName !== "undefined" && !EventManagerCollection.findOne()) {
		if (!localData.containsHashtag(Router.current().params.quizName)) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: "plugins.splashscreen.error.error_messages.session_closed"
			});
		}
		Router.go("/" + Router.current().params.quizName + "/resetToHome");
	} else {
		getChangeEventsForRoute(Router.current().route.getName());
		getRemoveEventsForRoute(Router.current().route.getName());
	}
	this.next();
});

Router.route('/', {
	action: function () {
		this.render('home');
	}
});

Router.route('/hashtagmanagement', {
	action: function () {
		this.render('hashtagManagement');
	}
});

Router.route('/showMore', {
	action: function () {
		this.render('showMore');
	}
});

// Routes for Footer-Links

Router.route('/about', function () {
	this.render('about');
});

Router.route('/agb', function () {
	this.render('agb');
});

Router.route('/dataprivacy', function () {
	this.render('dataprivacy');
});

Router.route('/imprint', function () {
	this.render('imprint');
});

Router.route('/translate', function () {
	this.render('translate');
});

Router.route('/theme', {
	action: function () {
		this.render('themeSwitcher');
	}
});

Router.route("/:quizName", {
	action: function () {
		if (this.ready()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
			let route = "/";
			if (EventManagerCollection.findOne()) {
				if (EventManagerCollection.findOne().sessionStatus === 2) {
					// User joins a session
					route = "/" + Router.current().params.quizName + "/nick";
				} else {
					if (localData.containsHashtag(Router.current().params.quizName)) {
						// User edits a session
						route = "/" + Router.current().params.quizName + "/question";
					}
				}
			} else {
				// If the user ownes the session he can edit it or create a new one
				if (HashtagsCollection.findOne(Router.current().params.quizName)) {
					if (localData.containsHashtag(Router.current().params.quizName)) {
						route = "/" + Router.current().params.quizName + "/question";
					}
				} else {
					route = "/" + Router.current().params.quizName + "/question";
				}
			}
			Router.go(route);
		} else {
			this.render("loading");
		}
	}
});

Router.route('/:quizName/resetToHome', function () {
	if (EventManagerCollection.findOne() && localData.containsHashtag(Router.current().params.quizName)) {
		Meteor.call("EventManagerCollection.clear", Router.current().params.quizName);
	}
	const userId = MemberListCollection.findOne({nick: localStorage[Router.current().params.quizName + "nick"]});
	if (!localData.containsHashtag(Router.current().params.quizName) && userId) {
		Meteor.call("MemberListCollection.removeLearner", Router.current().params.quizName, userId._id);
	}

	Session.set("questionGroup", undefined);
	delete Session.keys.questionGroup;

	delete localStorage[Router.current().params.quizName + "nick"];
	delete localStorage.slider;
	delete localStorage.lastPage;

	delete sessionStorage.overrideValidQuestionRedirect;

	Router.go("/");
});

Router.route('/:quizName/nick', {
	action: function () {
		if (EventManagerCollection.findOne() && EventManagerCollection.findOne().sessionStatus === 2) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			if (this.ready()) {
				this.render('nick');
			}
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/question', {
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			this.render('questionList', {to: 'header.questionList'});
			this.render('createQuestionView');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/answeroptions', {
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			this.render('questionList', {to: 'header.questionList'});
			this.render('createAnswerOptions');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/settimer', {
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			this.render('questionList', {to: 'header.questionList'});
			this.render('createTimerView');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/quizSummary', {
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			this.render('quizSummary');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/memberlist', {
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		this.render("memberlist");
	}
});

Router.route('/:quizName/votingview', {
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		this.render('votingview');
	}
});

Router.route('/:quizName/onpolling', {
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		if (localData.containsHashtag(Router.current().params.quizName)) {
			this.render('live_results');
		} else {
			this.render('votingview');
		}
	}
});
Router.route('/:quizName/results', {
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		this.render('live_results');
	}
});

Router.route('/:quizName/statistics', {
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		this.render('leaderBoard');
	}
});

Router.route('/:quizName/globalLeaderBoard', {
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		Session.set("showLeaderBoardId", undefined);
		Session.set("showGlobalRanking", true);
		this.render('leaderBoard');
	}
});
