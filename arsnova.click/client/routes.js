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
import {TAPi18n} from 'meteor/tap:i18n';
import {SubsManager} from 'meteor/meteorhacks:subs-manager';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import * as localData from '/client/lib/local_storage.js';
import { ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {globalEventStackObserver, setGlobalEventStackObserver} from '/client/plugins/event_stack_observer/scripts/lib.js';
import {getChangeEventsForRoute} from '/client/plugins/event_stack_observer/scripts/onChangeEvent.js';
import {getRemoveEventsForRoute} from '/client/plugins/event_stack_observer/scripts/onRemoveEvent.js';

export const subsCache = new SubsManager({
	cacheLimit: 10,
	expireIn: 5
});

Router.configure({
	layoutTemplate: "layout",
	loadingTemplate: "loading"
});

Router.onStop(function () {
	var lastRoute = Router.current().route.getName();
	if (lastRoute === undefined) {
		//homeView
		localStorage.setItem("lastPage", "/");
	} else if (lastRoute !== "agb" && lastRoute !== "datenschutz" && lastRoute !== "impressum") {
		localStorage.setItem("lastPage", lastRoute);
	}
});

Router.onBeforeAction(function () {
	if (!globalEventStackObserver) {
		setGlobalEventStackObserver();
	}
	this.next();
});

Router.route('/', {
	action: function () {
		try {
			localData.initializePrivateKey();
			localStorage.setItem("localStorageAvailable", true);
		} catch (err) {
			localStorage.setItem("localStorageAvailable", false);
		}
		this.render('home');
	}
});

Router.route('/hashtagmanagement', {
	action: function () {
		this.render('hashtagManagement');
	}
});

// Routes for Footer-Links

Router.route('/ueber', function () {
	this.render('ueber');
});

Router.route('/agb', function () {
	this.render('agb');
});

Router.route('/datenschutz', function () {
	this.render('datenschutz');
});

Router.route('/impressum', function () {
	this.render('impressum');
});

Router.route('/translate', function () {
	this.render('translate');
});

Router.route("/:quizName", {
	waitOn: function () {
		const subscriptions = [
			Meteor.subscribe('HashtagsCollection.public'),
			Meteor.subscribe('ResponsesCollection.session', Router.current().params.quizName),
			Meteor.subscribe('AnswerOptionCollection.options', Router.current().params.quizName),
			Meteor.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName),
			Meteor.subscribe('MemberListCollection.members', Router.current().params.quizName),
			Meteor.subscribe('EventManagerCollection.join', Router.current().params.quizName)
		];
		return subscriptions;
	},
	action: function () {
		if (this.ready()) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			getChangeEventsForRoute(Router.current().route.getName());
			getRemoveEventsForRoute(Router.current().route.getName());
			let route = "/";
			if (EventManagerCollection.findOne()) {
				if (EventManagerCollection.findOne().sessionStatus === 2) {
					// User joins a session
					route = "/" + Router.current().params.quizName + "/nick";
				} else {
					try {
						localData.initializePrivateKey();
						localStorage.setItem("localStorageAvailable", true);
						if (localData.containsHashtag(Router.current().params.quizName)) {
							// User edits a session
							route = "/" + Router.current().params.quizName + "/question";
						}
					} catch (err) {
						localStorage.setItem("localStorageAvailable", false);
					}
				}
			} else {
				try {
					localData.initializePrivateKey();
					localStorage.setItem("localStorageAvailable", true);
					// If the user ownes the session he can edit it or create a new one
					if (HashtagsCollection.findOne(Router.current().params.quizName)) {
						if (localData.containsHashtag(Router.current().params.quizName)) {
							route = "/" + Router.current().params.quizName + "/question";
						}
					} else {
						route = "/" + Router.current().params.quizName + "/question";
					}
				} catch (err) {
					localStorage.setItem("localStorageAvailable", false);
				}
			}
			Router.go(route);
		} else {
			this.render("loading");
		}
	}
});

Router.route('/:quizName/resetToHome', function () {
	delete localStorage[Router.current().params.quizName + "nick"];
	delete localStorage[Router.current().params.quizName + "overrideValidQuestionRedirect"];
	delete localStorage.slider;
	delete localStorage.lastPage;

	Router.go("/");
});

Router.route('/:quizName/nick', {
	waitOn: function () {
		const subscriptions = [
			this.subscribe('HashtagsCollection.public')
		];
		if (typeof Router.current().params.quizName !== "undefined") {
			subscriptions.push(this.subscribe('ResponsesCollection.session', Router.current().params.quizName));
			subscriptions.push(this.subscribe('AnswerOptionCollection.options', Router.current().params.quizName));
			subscriptions.push(this.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName));
			subscriptions.push(this.subscribe('MemberListCollection.members', Router.current().params.quizName));
			subscriptions.push(this.subscribe('EventManagerCollection.join', Router.current().params.quizName));
		}
		return subscriptions;
	},
	action: function () {
		if (EventManagerCollection.findOne() && EventManagerCollection.findOne().sessionStatus === 2) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			getChangeEventsForRoute(Router.current().route.getName());
			getRemoveEventsForRoute(Router.current().route.getName());
			this.render('nick');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/question', {
	waitOn: function () {
		const subscriptions = [
			this.subscribe('HashtagsCollection.public')
		];
		if (typeof Router.current().params.quizName !== "undefined") {
			subscriptions.push(this.subscribe('ResponsesCollection.session', Router.current().params.quizName));
			subscriptions.push(this.subscribe('AnswerOptionCollection.options', Router.current().params.quizName));
			subscriptions.push(this.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName));
			subscriptions.push(this.subscribe('MemberListCollection.members', Router.current().params.quizName));
			subscriptions.push(this.subscribe('EventManagerCollection.join', Router.current().params.quizName));
		}
		return subscriptions;
	},
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			getChangeEventsForRoute(Router.current().route.getName());
			getRemoveEventsForRoute(Router.current().route.getName());
			this.render('questionList', {to: 'header.questionList'});
			this.render('createQuestionView');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/answeroptions', {
	waitOn: function () {
		const subscriptions = [
			this.subscribe('HashtagsCollection.public')
		];
		if (typeof Router.current().params.quizName !== "undefined") {
			subscriptions.push(this.subscribe('ResponsesCollection.session', Router.current().params.quizName));
			subscriptions.push(this.subscribe('AnswerOptionCollection.options', Router.current().params.quizName));
			subscriptions.push(this.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName));
			subscriptions.push(this.subscribe('MemberListCollection.members', Router.current().params.quizName));
			subscriptions.push(this.subscribe('EventManagerCollection.join', Router.current().params.quizName));
		}
		return subscriptions;
	},
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			getChangeEventsForRoute(Router.current().route.getName());
			getRemoveEventsForRoute(Router.current().route.getName());
			this.render('questionList', {to: 'header.questionList'});
			this.render('createAnswerOptions');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/settimer', {
	waitOn: function () {
		const subscriptions = [
			this.subscribe('HashtagsCollection.public')
		];
		if (typeof Router.current().params.quizName !== "undefined") {
			subscriptions.push(this.subscribe('ResponsesCollection.session', Router.current().params.quizName));
			subscriptions.push(this.subscribe('AnswerOptionCollection.options', Router.current().params.quizName));
			subscriptions.push(this.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName));
			subscriptions.push(this.subscribe('MemberListCollection.members', Router.current().params.quizName));
			subscriptions.push(this.subscribe('EventManagerCollection.join', Router.current().params.quizName));
		}
		return subscriptions;
	},
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			getChangeEventsForRoute(Router.current().route.getName());
			getRemoveEventsForRoute(Router.current().route.getName());
			this.render('questionList', {to: 'header.questionList'});
			this.render('createTimerView');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/memberlist', {
	waitOn: function () {
		const subscriptions = [
			this.subscribe('HashtagsCollection.public'),
			this.subscribe('ResponsesCollection.session', Router.current().params.quizName),
			this.subscribe('AnswerOptionCollection.options', Router.current().params.quizName),
			this.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName),
			this.subscribe('MemberListCollection.members', Router.current().params.quizName),
			this.subscribe('EventManagerCollection.join', Router.current().params.quizName)
		];
		return subscriptions;
	},
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		getChangeEventsForRoute(Router.current().route.getName());
		getRemoveEventsForRoute(Router.current().route.getName());
		this.render("memberlist");
	}
});

Router.route('/:quizName/votingview', {
	waitOn: function () {
		const subscriptions = [
			this.subscribe('HashtagsCollection.public')
		];
		if (typeof Router.current().params.quizName !== "undefined") {
			subscriptions.push(this.subscribe('ResponsesCollection.session', Router.current().params.quizName));
			subscriptions.push(this.subscribe('AnswerOptionCollection.options', Router.current().params.quizName));
			subscriptions.push(this.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName));
			subscriptions.push(this.subscribe('MemberListCollection.members', Router.current().params.quizName));
			subscriptions.push(this.subscribe('EventManagerCollection.join', Router.current().params.quizName));
		}
		return subscriptions;
	},
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		getChangeEventsForRoute(Router.current().route.getName());
		getRemoveEventsForRoute(Router.current().route.getName());
		this.render('votingview');
	}
});


Router.route('/:quizName/onpolling', {
	waitOn: function () {
		const subscriptions = [
			this.subscribe('HashtagsCollection.public')
		];
		if (typeof Router.current().params.quizName !== "undefined") {
			subscriptions.push(this.subscribe('ResponsesCollection.session', Router.current().params.quizName));
			subscriptions.push(this.subscribe('AnswerOptionCollection.options', Router.current().params.quizName));
			subscriptions.push(this.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName));
			subscriptions.push(this.subscribe('MemberListCollection.members', Router.current().params.quizName));
			subscriptions.push(this.subscribe('EventManagerCollection.join', Router.current().params.quizName));
		}
		return subscriptions;
	},
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		getChangeEventsForRoute(Router.current().route.getName());
		getRemoveEventsForRoute(Router.current().route.getName());
		if (localData.containsHashtag(Router.current().params.quizName)) {
			this.render('live_results');
		} else {
			this.render('votingview');
		}
	}
});
Router.route('/:quizName/results', {
	waitOn: function () {
		const subscriptions = [
			this.subscribe('HashtagsCollection.public')
		];
		if (typeof Router.current().params.quizName !== "undefined") {
			subscriptions.push(this.subscribe('ResponsesCollection.session', Router.current().params.quizName));
			subscriptions.push(this.subscribe('AnswerOptionCollection.options', Router.current().params.quizName));
			subscriptions.push(this.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName));
			subscriptions.push(this.subscribe('MemberListCollection.members', Router.current().params.quizName));
			subscriptions.push(this.subscribe('EventManagerCollection.join', Router.current().params.quizName));
		}
		return subscriptions;
	},
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		getChangeEventsForRoute(Router.current().route.getName());
		getRemoveEventsForRoute(Router.current().route.getName());
		this.render('live_results');
	}
});

Router.route('/:quizName/statistics', {
	waitOn: function () {
		const subscriptions = [
			this.subscribe('HashtagsCollection.public')
		];
		if (typeof Router.current().params.quizName !== "undefined") {
			subscriptions.push(this.subscribe('ResponsesCollection.session', Router.current().params.quizName));
			subscriptions.push(this.subscribe('AnswerOptionCollection.options', Router.current().params.quizName));
			subscriptions.push(this.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName));
			subscriptions.push(this.subscribe('MemberListCollection.members', Router.current().params.quizName));
			subscriptions.push(this.subscribe('EventManagerCollection.join', Router.current().params.quizName));
		}
		return subscriptions;
	},
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		getChangeEventsForRoute(Router.current().route.getName());
		getRemoveEventsForRoute(Router.current().route.getName());
		this.render('leaderBoard');
	}
});
