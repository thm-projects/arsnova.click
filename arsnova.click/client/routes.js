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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import * as localData from '/client/lib/local_storage.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {Splashscreen, ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {globalEventStackObserver, setGlobalEventStackObserver} from '/client/plugins/event_stack_observer/scripts/lib.js';

Router.configure({
	layoutTemplate: "layout",
	loadingTemplate: "loading",
	waitOn: function () {
		const subscriptions = [];
		if (typeof Router.current().params.quizName !== "undefined") {
			subscriptions.push(Meteor.subscribe('EventManagerCollection.join', Router.current().params.quizName));
		}
		return subscriptions;
	}
});

Router.onBeforeAction(function () {
	if (typeof Router.current().params.quizName !== "undefined") {
		if (!globalEventStackObserver) {
			setGlobalEventStackObserver();
			if (!globalEventStackObserver.isRunning()) {
				if (!EventManagerCollection.findOne(Router.current().params.quizName)) {
					Meteor.call('EventManagerCollection.add', localData.getPrivateKey(), Router.current().params.quizName, function () {
						globalEventStackObserver.startObserving(Router.current().params.quizName);
					});
				}
			}
		}
		globalEventStackObserver.onChange([
			"EventManagerCollection.setSessionStatus",
			"EventManagerCollection.reset"
		], function (key, value) {
			if (!isNaN(value.sessionStatus)) {
				if (value.sessionStatus < 2) {
					if (!localData.containsHashtag(Router.current().params.quizName)) {
						new ErrorSplashscreen({
							autostart: true,
							errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages.session_closed")
						});
					}
					Router.go("/" + Router.current().params.quizName + "/resetToHome");
				}
			}
		});
	}
	this.next();
});

Router.onAfterAction(function () {
	$('#loader-wrapper').toggleClass('loaded');
});

Router.route("/loading", {
	action: function () {
		this.render("loading");
	}
});

Router.route('/', {
	waitOn: function () {
		return [
			Meteor.subscribe('HashtagsCollection.public')
		];
	},
	action: function () {
		try {
			localData.initializePrivateKey();
			localStorage.setItem("localStorageAvailable", true);
		} catch (err) {
			localStorage.setItem("localStorageAvailable", false);
		}
		localStorage.setItem("slider", undefined);
		this.render('home');
	}
});

Router.route('/:quizName/resetToHome', function () {
	delete localStorage[Router.current().params.quizName + "nick"];
	Router.go("/");
});

Router.route('/:quizName/nick', function () {
	this.render('nick');
});

Router.route('/:quizName/question', {

	waitOn: function () {
		return [
			Meteor.subscribe('QuestionGroupCollection.authorizeAsOwner', localData.getPrivateKey(), Router.current().params.quizName),
			Meteor.subscribe("EventManagerCollection.join", Router.current().params.quizName)
		];
	},

	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			if (!EventManagerCollection.findOne(Router.current().params.quizName)) {
				Meteor.call('EventManagerCollection.setActiveQuestion', localData.getPrivateKey(), Router.current().params.quizName, 0);
			}
			this.render('createQuestionView');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/answeroptions', {
	waitOn: function () {
		return [
			Meteor.subscribe('AnswerOptionCollection.instructor', localData.getPrivateKey(), Router.current().params.quizName),
			Meteor.subscribe('EventManagerCollection.join', Router.current().params.quizName)
		];
	},
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			this.render('createAnswerOptions');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/settimer', {
	waitOn: function () {
		return [
			Meteor.subscribe('AnswerOptionCollection.instructor', localData.getPrivateKey(), Router.current().params.quizName),
			Meteor.subscribe('QuestionGroupCollection.authorizeAsOwner', localData.getPrivateKey(), Router.current().params.quizName),
			Meteor.subscribe("EventManagerCollection.join", Router.current().params.quizName)
		];
	},
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			this.render('createTimerView');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/memberlist', {
	waitOn: function () {
		return [
			Meteor.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName),
			Meteor.subscribe('ResponsesCollection.session', Router.current().params.quizName),
			Meteor.subscribe('MemberListCollection.members', Router.current().params.quizName)
		];
	},
	action: function () {
		globalEventStackObserver.onChange([
			"EventManagerCollection.setSessionStatus"
		], function (key, value) {
			if (!isNaN(value.sessionStatus)) {
				if (value.sessionStatus === 3) {
					Router.go("/" + Router.current().params.quizName + "/results");
				}
			}
		});

		globalEventStackObserver.onChange([
			"MemberListCollection.removeLearner"
		], function (key, value) {
			if (value.user) {
				if (value.user === localStorage.getItem(Router.current().params.quizName + "nick")) {
					new ErrorSplashscreen({
						autostart: true,
						errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages.kicked_from_quiz")
					});
					Router.go("/" + Router.current().params.quizName + "/resetToHome");
				}
			}
		});
		this.render('memberlist');
	}
});

Router.route('/:quizName/votingview', {
	waitOn: function () {
		return [
			Meteor.subscribe("EventManagerCollection.join", Router.current().params.quizName),
			Meteor.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName),
			Meteor.subscribe('AnswerOptionCollection.public', Router.current().params.quizName)
		];
	},
	action: function () {
		this.render('votingview');
	}
});


Router.route('/:quizName/onpolling', {
	waitOn: function () {
		return [
			Meteor.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName),
			Meteor.subscribe('ResponsesCollection.session', Router.current().params.quizName),
			Meteor.subscribe('AnswerOptionCollection.options', Router.current().params.quizName),
			Meteor.subscribe('MemberListCollection.members', Router.current().params.quizName),
			Meteor.subscribe('HashtagsCollection.public')
		];
	},

	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			this.render('live_results');
		} else {
			this.render('votingview');
		}
	}
});
Router.route('/:quizName/results', {
	waitOn: function () {
		return [
			Meteor.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName),
			Meteor.subscribe('ResponsesCollection.session', Router.current().params.quizName),
			Meteor.subscribe('AnswerOptionCollection.options', Router.current().params.quizName),
			Meteor.subscribe('MemberListCollection.members', Router.current().params.quizName),
			Meteor.subscribe('HashtagsCollection.public')
		];
	},
	action: function () {
		globalEventStackObserver.onChange([
			"EventManagerCollection.setSessionStatus"
		], function (key, value) {
			if (!isNaN(value.sessionStatus)) {
				if (value.sessionStatus === 2) {
					$('.modal-backdrop').remove();
					Router.go("/" + Router.current().params.quizName + "/memberlist");
				}
			}
		});

		globalEventStackObserver.onChange([
			"EventManagerCollection.setActiveQuestion"
		], function (key, value) {
			if (!isNaN(value.questionIndex) && value.questionIndex !== -1) {
				if (localData.containsHashtag(Router.current().params.quizName)) {
					new Splashscreen({
						autostart: true,
						instanceId: "answers_" + EventManagerCollection.findOne().questionIndex,
						templateName: 'questionAndAnswerSplashscreen',
						closeOnButton: '#js-btn-hideQuestionModal',
						onRendered: function (instance) {
							var content = "";
							mathjaxMarkdown.initializeMarkdownAndLatex();
							AnswerOptionCollection.find({questionIndex: EventManagerCollection.findOne().questionIndex}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
								if (!answerOption.answerText) {
									answerOption.answerText = "";
								}

								content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
								content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
							});

							instance.templateSelector.find('#answerContent').html(content);
							setTimeout(function () {
								instance.close();
							}, 10000);
						}
					});
				} else {
					Router.go("/" + Router.current().params.quizName + "/onpolling");
				}
			}
		});

		globalEventStackObserver.onChange([
			"EventManagerCollection.showReadConfirmedForIndex"
		], function (key, value) {
			if (!isNaN(value.readingConfirmationIndex) && value.readingConfirmationIndex > -1) {
				var questionDoc = QuestionGroupCollection.findOne();
				new Splashscreen({
					autostart: true,
					templateName: 'readingConfirmedSplashscreen',
					closeOnButton: '#setReadConfirmed',
					onRendered: function (instance) {
						var content = "";
						if (questionDoc) {
							mathjaxMarkdown.initializeMarkdownAndLatex();
							var questionText = questionDoc.questionList[EventManagerCollection.findOne().readingConfirmationIndex].questionText;
							content = mathjaxMarkdown.getContent(questionText);
						}
						instance.templateSelector.find('#questionContent').html(content);

						if (localData.containsHashtag(Router.current().params.quizName)) {
							instance.templateSelector.find('#setReadConfirmed').text(TAPi18n.__("global.close_window"));
						} else {
							instance.templateSelector.find('#setReadConfirmed').parent().on('click', '#setReadConfirmed', function () {
								Meteor.call("MemberListCollection.setReadConfirmed", {
									hashtag: Router.current().params.quizName,
									questionIndex: EventManagerCollection.findOne().readingConfirmationIndex,
									nick: localStorage.getItem(Router.current().params.quizName + "nick")
								}, (err)=> {
									if (err) {
										new ErrorSplashscreen({
											autostart: true,
											errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
										});
									}
								});
							});
						}
					}
				});
			}
		});
		this.render('live_results');
	}
});

Router.route('/:quizName/statistics', {
	waitOn: function () {
		Meteor.subscribe('ResponsesCollection.session', Router.current().params.quizName);
		Meteor.subscribe('AnswerOptionCollection.options', Router.current().params.quizName);
		Meteor.subscribe('MemberListCollection.members', Router.current().params.quizName);
		Meteor.subscribe('QuestionGroupCollection.questionList', Router.current().params.quizName);
		Meteor.subscribe("EventManagerCollection.join", Router.current().params.quizName);
	},
	action: function () {
		this.render('leaderBoard');
	}
});

Router.route('/hashtagmanagement', {
	waitOn: function () {
		return [
			Meteor.subscribe('HashtagsCollection.public'),
			Meteor.subscribe("EventManagerCollection.join", Router.current().params.quizName)
		];
	},
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

Router.onStop(function () {
	var lastRoute = Router.current().route.getName();
	if (lastRoute === undefined) {
		//homeView
		localStorage.setItem(Router.current().params.quizName + "lastPage", "/");
	} else if (lastRoute !== "agb" && lastRoute !== "datenschutz" && lastRoute !== "impressum") {
		localStorage.setItem(Router.current().params.quizName + "lastPage", lastRoute);
	}
});
