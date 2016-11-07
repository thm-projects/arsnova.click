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
import {MemberListCollection} from '/lib/member_list/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as localData from '/lib/local_storage.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {globalEventStackObserver, setGlobalEventStackObserver} from '/client/plugins/event_stack_observer/scripts/lib.js';
import {getChangeEventsForRoute} from '/client/plugins/event_stack_observer/scripts/onChangeEvent.js';
import {getRemoveEventsForRoute} from '/client/plugins/event_stack_observer/scripts/onRemoveEvent.js';
import {createTabIndices} from '/client/startup.js';

const subsCache = new SubsManager({
	/* maximum number of cached subscriptions */
	cacheLimit: 9,
	/* any subscription will expire after 15 minutes, if it's not subscribed again */
	expireIn: 15
});

export function cleanUp() {
	console.trace();
	if (localData.containsHashtag(Router.current().params.quizName)) {
		if (EventManagerCollection.findOne()) {
			Meteor.call("EventManagerCollection.clear", Router.current().params.quizName);
		}
	} else {
		const userDoc = MemberListCollection.findOne({nick: localStorage.getItem(Router.current().params.quizName + "nick")});
		if (userDoc) {
			console.log("userdoc", userDoc);
			Meteor.call("MemberListCollection.removeLearner", Router.current().params.quizName, userDoc._id);
		}
	}

	Session.set("questionGroup", undefined);
	delete Session.keys.questionGroup;

	Meteor.logout();

	localStorage.removeItem(Router.current().params.quizName + "nick");
	localStorage.removeItem("slider");
	localStorage.removeItem("lastPage");
	sessionStorage.removeItem("overrideValidQuestionRedirect");
}

Router.configure({
	layoutTemplate: "layout",
	loadingTemplate: "loading",
	waitOn: function () {
		const subscriptions = [
			subsCache.subscribe('HashtagsCollection.public'),
			subsCache.subscribe('BannedNicksCollection.public'),
			Meteor.subscribe("ConnectionStatusCollection.join", localData.getPrivateKey())
		];
		const currentHashtag = Router.current().params.quizName;
		if (typeof currentHashtag !== "undefined") {
			Meteor.subscribe('SessionConfigurationCollection.join', currentHashtag);
			subscriptions.push(subsCache.subscribe('ResponsesCollection.join', currentHashtag));
			subscriptions.push(subsCache.subscribe('AnswerOptionCollection.join', currentHashtag));
			subscriptions.push(subsCache.subscribe('QuestionGroupCollection.join', currentHashtag));
			subscriptions.push(subsCache.subscribe('MemberListCollection.join', currentHashtag));
			subscriptions.push(subsCache.subscribe('LeaderBoardCollection.join', currentHashtag));
			subscriptions.push(subsCache.subscribe('EventManagerCollection.join', currentHashtag));
			subscriptions.push(subsCache.subscribe('NicknameCategoriesCollection.join'));
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
	let theme = "theme-arsnova-dot-click-contrast";
	if (!localStorage.getItem("theme")) {
		localStorage.setItem("theme", theme);
	} else {
		theme = localStorage.getItem("theme");
	}
	if (Router.current().params.quizName) {
		const configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
		if (configDoc && configDoc.theme && !localData.containsHashtag(Router.current().params.quizName)) {
			sessionStorage.setItem("quizTheme", configDoc.theme);
			theme = configDoc.theme;
		}
	}
	Session.set("theme", theme);
	this.next();
});

Router.onBeforeAction(function () {
	if (Router.current().originalUrl === "/" + Router.current().params.quizName + "/resetToHome") {
		return;
	}
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

Router.onAfterAction(function () {
	createTabIndices();
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
				route = "/" + Router.current().params.quizName + "/question";
			}
			Router.go(route);
		} else {
			this.render("loading");
		}
	}
});

Router.route('/:quizName/showMore', {
	action: function () {
		this.render('showMore');
	}
});

Router.route('/:quizName/resetToHome', function () {
	cleanUp();
	Router.go("/");
});

Router.route('/:quizName/nick', {
	action: function () {
		if (EventManagerCollection.findOne() && EventManagerCollection.findOne().sessionStatus === 2) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			this.render('nickViewWrapper');
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

Router.route('/:quizName/nicknameCategories', {
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			this.render('nicknameCategories');
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

Router.route('/:quizName/leaderBoard/:id', {
	waitOn: function () {
		Meteor.subscribe('AllAttendeeUsersList', Router.current().params.quizName, localData.getPrivateKey());
	},
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		this.render('leaderBoard');
	}
});
