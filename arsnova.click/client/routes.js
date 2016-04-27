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
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManager} from '/lib/eventmanager.js';
import {AnswerOptions} from '/lib/answeroptions.js';
import {QuestionGroup} from '/lib/questions.js';
import * as localData from '/client/lib/local_storage.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {Splashscreen, splashscreenError} from '/client/plugins/splashscreen/scripts/lib.js';
import {globalEventStackObserver, setGlobalEventStackObserver} from '/client/plugins/event_stack_observer/scripts/lib.js';

Router.configure({
	layoutTemplate: 'layout'
});

Router.onBeforeAction(function () {
	if (!globalEventStackObserver || !globalEventStackObserver.isRunning()) {
		if (Router.current().route.path() !== "/") {
			Meteor.subscribe('EventManager.join', Session.get("hashtag"), ()=> {
				if (!EventManager.findOne(Session.get("hashtag"))) {
					Meteor.call('EventManager.add', localData.getPrivateKey(), Session.get("hashtag"), function () {
						globalEventStackObserver.start(Session.get("hashtag"));
					});
				}
			});
		}
	}
	this.next();
});

Router.route('/', function () {
	try {
		localData.initializePrivateKey();
		Session.set("localStorageAvailable", true);
	} catch (err) {
		Session.set("localStorageAvailable", false);
	}

	Session.set("isOwner", undefined);
	Session.set("hashtag", undefined);
	Session.set("slider", undefined);
	setGlobalEventStackObserver();
	this.render('home');
});

Router.route('/resetToHome', function () {
	$('.modal-backdrop').hide();
	Router.go("/");
});

Router.route('/nick', function () {
	if (!Session.get("hashtag")) {
		Router.go("/");
	}
	this.render('nick');
});

Router.route('/question', function () {
	if (Session.get("isOwner")) {
		Meteor.subscribe('EventManager.join', Session.get("hashtag"), ()=> {
			if (!EventManager.findOne(Session.get("hashtag"))) {
				Meteor.call('EventManager.setActiveQuestion', localData.getPrivateKey(), Session.get("hashtag"), 0);
			}
		});
		this.render('createQuestionView');
	} else {
		Router.go("/");
	}
});

Router.route('/answeroptions', function () {
	this.render('createAnswerOptions');
});

Router.route('/settimer', function () {
	if (Session.get("isOwner")) {
		this.render('createTimerView');
	} else {
		Router.go('/');
	}
});

Router.route('/memberlist', function () {
	globalEventStackObserver.onChange([
		"EventManager.setSessionStatus",
		"EventManager.reset"
	], function (key, value) {
		if (!isNaN(value.sessionStatus)) {
			if (value.sessionStatus < 2) {
				if (Session.get("isOwner")) {
					Router.go("/settimer");
				} else {
					Router.go("/resetToHome");
				}
			} else if (value.sessionStatus === 3) {
				Router.go("/results");
			}
		}
	});
	this.render('memberlist');
});

Router.route('/votingview', function () {
	this.render('votingview');
});


Router.route('/onpolling', {
	waitOn: function () {
		return [
			Meteor.subscribe('QuestionGroup.questionList', Session.get("hashtag")),
			Meteor.subscribe('EventManager.join', Session.get("hashtag")),
			Meteor.subscribe('Responses.session', Session.get("hashtag")),
			Meteor.subscribe('AnswerOptions.options', Session.get("hashtag")),
			Meteor.subscribe('MemberList.members', Session.get("hashtag")),
			Meteor.subscribe('Hashtags.public')
		];
	},

	action: function () {
		if (Session.get("isOwner")) {
			this.render('live_results');
		} else {
			$('.modal-backdrop').hide();
			this.render('votingview');
		}
	}
});
Router.route('/results', {
	waitOn: function () {
		return [
			Meteor.subscribe('QuestionGroup.questionList', Session.get("hashtag")),
			Meteor.subscribe('EventManager.join', Session.get("hashtag")),
			Meteor.subscribe('Responses.session', Session.get("hashtag")),
			Meteor.subscribe('AnswerOptions.options', Session.get("hashtag")),
			Meteor.subscribe('MemberList.members', Session.get("hashtag")),
			Meteor.subscribe('Hashtags.public')
		];
	},

	action: function () {
		globalEventStackObserver.onChange([
			"EventManager.setSessionStatus",
			"EventManager.reset"
		], function (key, value) {
			if (!isNaN(value.sessionStatus)) {
				if (value.sessionStatus === 2) {
					$('.modal-backdrop').remove();
					Router.go("/memberlist");
				} else if (value.sessionStatus < 2) {
					$('.modal-backdrop').remove();
					Router.go("/resetToHome");
				}
			}
		});

		globalEventStackObserver.onChange(["EventManager.setActiveQuestion"], function (key, value) {
			if (!isNaN(value.questionIndex) && value.questionIndex !== -1) {
				if (Session.get("isOwner")) {
					new Splashscreen({
						autostart: true,
						instanceId: "answers_" + EventManager.findOne().questionIndex,
						templateName: 'questionAndAnswerSplashscreen',
						closeOnButton: '#js-btn-hideQuestionModal',
						onRendered: function (instance) {
							var content = "";
							mathjaxMarkdown.initializeMarkdownAndLatex();
							AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
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
					Router.go("/onpolling");
				}
			}
		});

		globalEventStackObserver.onChange(["EventManager.showReadConfirmedForIndex"], function (key, value) {
			if (!isNaN(value.readingConfirmationIndex) && value.readingConfirmationIndex > -1) {
				var questionDoc = QuestionGroup.findOne();
				new Splashscreen({
					autostart: true,
					templateName: 'readingConfirmedSplashscreen',
					closeOnButton: '#setReadConfirmed',
					onRendered: function (instance) {
						var content = "";
						if (questionDoc) {
							mathjaxMarkdown.initializeMarkdownAndLatex();
							var questionText = questionDoc.questionList[EventManager.findOne().readingConfirmationIndex].questionText;
							content = mathjaxMarkdown.getContent(questionText);
						}
						instance.templateSelector.find('#questionContent').html(content);

						if (Session.get("isOwner")) {
							instance.templateSelector.find('#setReadConfirmed').text(TAPi18n.__("global.close_window"));
						} else {
							instance.templateSelector.find('#setReadConfirmed').parent().on('click', '#setReadConfirmed', function () {
								Meteor.call("MemberList.setReadConfirmed", {
									hashtag: Session.get("hashtag"),
									questionIndex: EventManager.findOne().readingConfirmationIndex,
									nick: Session.get("nick")
								}, (err)=> {
									if (err) {
										splashscreenError.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason));
										splashscreenError.open();
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
/*
Router.route('/onpolling', function () {
	if (Session.get("isOwner")) {
		this.render('liveResults');
	} else {
		$('.modal-backdrop').hide();
		this.render('votingview');
	}
});
Router.route('/results', function () {
	this.render('liveResults');
});
*/
Router.route('/statistics', function () {
	this.render('leaderBoard');
});

Router.route('/hashtagmanagement', function () {
	this.render('hashtagManagement');
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
		Session.set("lastPage", "/");
	} else if (lastRoute !== "agb" && lastRoute !== "datenschutz" && lastRoute !== "impressum") {
		Session.set("lastPage", lastRoute);
	}
});
