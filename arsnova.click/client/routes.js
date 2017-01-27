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
import {Router, RouteController} from 'meteor/iron:router';
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
import {checkIfThemeExist} from "/shared/themes.js";

const subsCache = new SubsManager({
	/* maximum number of cached subscriptions */
	cacheLimit: 11,
	/* any subscription will expire after 15 minutes, if it's not subscribed again */
	expireIn: 15
});

export function cleanUp() {
	if (localData.containsHashtag(Router.current().params.quizName)) {
		if (EventManagerCollection.findOne()) {
			Meteor.call("EventManagerCollection.clear", Router.current().params.quizName);
		}
	} else {
		const userDoc = MemberListCollection.findOne({nick: localStorage.getItem(Router.current().params.quizName + "nick")});
		if (userDoc) {
			Meteor.call("MemberListCollection.removeLearner", Router.current().params.quizName, userDoc._id);
		}
	}

	Session.delete("questionGroup");

	Meteor.logout();

	localStorage.removeItem(Router.current().params.quizName + "nick");
	localStorage.removeItem("slider");
	localStorage.removeItem("lastPage");
	sessionStorage.removeItem("overrideValidQuestionRedirect");
}

Router.configure({
	layoutTemplate: "layout",
	loadingTemplate: "loading",
	fastRender: true
});

const onBeforeAction = function () {
	if (Router.current().originalUrl === "/" && Router.current().params.quizName) {
		this.next();
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
};

const NonBlockingRouteController = RouteController.extend({
	onBeforeAction: onBeforeAction,
	subscriptions: function () {
		subsCache.subscribe('HashtagsCollection.public');
	}
});
const BlockingRouteController = RouteController.extend({
	onBeforeAction: onBeforeAction,
	waitOn: function () {
		const currentHashtag = Router.current().params.quizName;
		return [
			subsCache.subscribe('BannedNicksCollection.public'),
			subsCache.subscribe('NicknameCategoriesCollection.join'),
			subsCache.subscribe('SessionConfigurationCollection.join', currentHashtag),
			subsCache.subscribe('ResponsesCollection.join', currentHashtag),
			subsCache.subscribe('AnswerOptionCollection.join', currentHashtag),
			subsCache.subscribe('QuestionGroupCollection.join', currentHashtag),
			subsCache.subscribe('MemberListCollection.join', currentHashtag),
			subsCache.subscribe('LeaderBoardCollection.join', currentHashtag),
			subsCache.subscribe('EventManagerCollection.join', currentHashtag)
		];
	}
});

Router.onStop(function () {
	const lastRoute = Router.current().route.getName();
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
	let theme = Meteor.settings.public.defaultTheme;
	if (!localStorage.getItem("theme")) {
		localStorage.setItem("theme", theme);
	} else {
		theme = localStorage.getItem("theme");
		if (!checkIfThemeExist(theme)) {
			theme = Meteor.settings.public.defaultTheme;
			localStorage.setItem("theme", theme);
		}
	}
	if (Router.current().params.quizName) {
		const configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
		if (configDoc && configDoc.theme && !localData.containsHashtag(Router.current().params.quizName)) {
			if (!checkIfThemeExist(configDoc.theme)) {
				configDoc.theme = Meteor.settings.public.defaultTheme;
			}
			sessionStorage.setItem("quizTheme", configDoc.theme);
			theme = configDoc.theme;
		}
	}
	if (!Session.get("overrideTheme")) {
		Session.set("theme", theme);
	}
	this.next();
});

Router.onAfterAction(function () {
	createTabIndices();
});

Router.route('/', {
	controller: NonBlockingRouteController,
	action: function () {
		this.render("titel", {
			to: "header.title",
			data: function () {
				return {titelText: 'global.arsnova_slogan'};
			}
		});
		this.render('home');
	}
});

Router.route('/hashtagmanagement', {
	controller: NonBlockingRouteController,
	action: function () {
		this.render('footerNavButtons', {
			to: 'footer.navigation',
			data: function () {
				return {
					backButton: {
						id: "backButton"
					}
				};
			}
		});
		this.render('hashtagManagement');
	}
});

Router.route('/preview/:themeName/:language', {
	action: function () {
		this.render("titel", {
			to: "header.title",
			data: function () {
				return {titelText: 'global.arsnova_slogan'};
			}
		});
		this.render('home');
		Session.set("theme", Router.current().params.themeName);
		Session.set("overrideTheme", true);
		TAPi18n.setLanguage(Router.current().params.language);
		$("body").removeClass().addClass(Session.get("theme"));
	}
});

// Routes for Footer-Links

Router.route('/about', {
	action: function () {
		this.render('footerNavButtons', {
			to: 'footer.navigation',
			data: function () {
				return {
					backButton: {
						id: "backButton"
					}
				};
			}
		});
		this.render('about');
	}
});

Router.route('/agb', {
	action: function () {
		this.render('footerNavButtons', {
			to: 'footer.navigation',
			data: function () {
				return {
					backButton: {
						id: "backButton"
					}
				};
			}
		});
		this.render('agb');
	}
});

Router.route('/dataprivacy', {
	action: function () {
		this.render('footerNavButtons', {
			to: 'footer.navigation',
			data: function () {
				return {
					backButton: {
						id: "backButton"
					}
				};
			}
		});
		this.render('dataprivacy');
	}
});

Router.route('/imprint', {
	action: function () {
		this.render('footerNavButtons', {
			to: 'footer.navigation',
			data: function () {
				return {
					backButton: {
						id: "backButton"
					}
				};
			}
		});
		this.render('imprint');
	}
});

Router.route('/translate', {
	action: function () {
		this.render('footerNavButtons', {
			to: 'footer.navigation',
			data: function () {
				return {
					backButton: {
						id: "backButton"
					}
				};
			}
		});
		this.render('translate');
	}
});

Router.route('/theme', {
	action: function () {
		this.render('footerNavButtons', {
			to: 'footer.navigation',
			data: function () {
				return {
					backButton: {
						id: "backButton"
					}
				};
			}
		});
		this.render('themeSwitcher');
	}
});

Router.route('/showMore', {
	controller: NonBlockingRouteController,
	action: function () {
		this.render('footerNavButtons', {
			to: 'footer.navigation',
			data: function () {
				return {
					backButton: {
						id: "backButton"
					}
				};
			}
		});
		this.render('showMore');
	}
});

Router.route("/:quizName", {
	controller: BlockingRouteController,
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

Router.route('/:quizName/theme', {
	controller: BlockingRouteController,
	action: function () {
		this.render('footerNavButtons', {
			to: 'footer.navigation',
			data: function () {
				return {
					backButton: {
						id: "backButton"
					}
				};
			}
		});
		this.render('themeSwitcher');
	}
});

Router.route('/:quizName/showMore', {
	controller: BlockingRouteController,
	action: function () {
		this.render('footerNavButtons', {
			to: 'footer.navigation',
			data: function () {
				return {
					backButton: {
						id: "backButton"
					}
				};
			}
		});
		this.render('showMore');
	}
});

Router.route('/:quizName/resetToHome', {
	action: function () {
		cleanUp();
		Router.go("/");
	}
});

Router.route('/:quizName/nick', {
	controller: BlockingRouteController,
	action: function () {
		if (EventManagerCollection.findOne() && EventManagerCollection.findOne().sessionStatus === 2) {
			if (!globalEventStackObserver.isRunning()) {
				globalEventStackObserver.startObserving(Router.current().params.quizName);
			}
			const configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
			if (configDoc) {
				if (configDoc.nicks.selectedValues.length !== 0) {
					this.render('nickLimitedFooter', {
						to: 'footer.navigation'
					});
				} else {
					this.render('nickStandardFooter', {
						to: 'footer.navigation'
					});
				}
			}
			this.render('nickViewWrapper');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/quizManager', {
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			this.render('footerNavButtons', {
				to: 'footer.navigation',
				data: function () {
					return {
						backButton: {
							id: "backButton",
							text: 'view.quiz_manager.back_to_quiz_administration',
							intro: "view.quiz_manager.description.back_button"
						},
						forwardButton: {
							id: "forwardButton",
							text: 'view.quiz_summary.start_quiz',
							intro: "view.quiz_manager.description.forward_button"
						}
					};
				}
			});
			this.render('quizManager');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/quizManager/:questionIndex', {
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			this.render('footerNavButtons', {
				to: 'footer.navigation',
				data: function () {
					return {
						backButton: {
							id: "backButton",
							text: "view.quiz_manager_details.back"
						}
					};
				}
			});
			this.render('quizManagerDetails');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/questionType/:questionIndex', {
	action: function () {
		if (!localData.containsHashtag(Router.current().params.quizName)) {
			Router.go("/");
		} else {
			this.render('footerNavButtons', {
				to: 'footer.navigation',
				data: function () {
					return {
						backButton: {
							id: "backButton",
							text: "view.question_type.back"
						}
					};
				}
			});
			this.render('questionTypeView');
		}
	}
});

Router.route('/:quizName/question/:questionIndex', {
	action: function () {
		if (!localData.containsHashtag(Router.current().params.quizName)) {
			Router.go("/");
		} else {
			this.render('footerNavButtons', {
				to: 'footer.navigation',
				data: function () {
					if (Session.get("questionGroup") && Session.get("questionGroup").getIsFirstStart()) {
						return {
							forwardButton: {
								id: "forwardButton",
								text: "view.questions.forward"
							}
						};
					} else {
						return {
							backButton: {
								id: "backButton",
								text: "view.questions.back"
							}
						};
					}
				}
			});
			this.render('createQuestionView');
		}
	}
});

Router.route('/:quizName/answeroptions/:questionIndex', {
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			this.render('footerNavButtons', {
				to: 'footer.navigation',
				data: function () {
					if (Session.get("questionGroup") && Session.get("questionGroup").getIsFirstStart()) {
						return {
							forwardButton: {
								id: "forwardButton",
								text: "view.answeroptions.forward"
							}
						};
					} else {
						return {
							backButton: {
								id: "backButton",
								text: "view.answeroptions.back"
							}
						};
					}
				}
			});
			this.render('createAnswerOptions');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/settimer/:questionIndex', {
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			this.render('footerNavButtons', {
				to: 'footer.navigation',
				data: function () {
					if (Session.get("questionGroup") && Session.get("questionGroup").getIsFirstStart()) {
						return {
							forwardButton: {
								id: "forwardButton",
								text: "view.timer.forward"
							}
						};
					} else {
						return {
							backButton: {
								id: "backButton",
								text: "view.timer.back"
							}
						};
					}
				}
			});
			this.render('createTimerView');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/nicknameCategories', {
	waitOn: function () {
		return [
			subsCache.subscribe('NicknameCategoriesCollection.join')
		];
	},
	action: function () {
		if (localData.containsHashtag(Router.current().params.quizName)) {
			this.render('footerNavButtons', {
				to: 'footer.navigation',
				data: function () {
					return {
						backButton: {
							id: "backButton",
							text: 'view.nickname_categories.back'
						}
					};
				}
			});
			this.render('nicknameCategories');
		} else {
			Router.go("/");
		}
	}
});

Router.route('/:quizName/memberlist', {
	controller: BlockingRouteController,
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		this.render("memberlistTitel", {to: "header.title"});
		this.render('memberlistFooterNavButtons', {
			to: 'footer.navigation',
			data: function () {
				return {
					backButton: {
						id: "backButton"
					},
					forwardButton: {
						id: "forwardButton"
					}
				};
			}
		});
		this.render("memberlist");
	}
});

Router.route('/:quizName/onpolling', {
	controller: BlockingRouteController,
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		this.render("votingviewTitel", {to: "header.title"});
		this.render('votingview');
	}
});
Router.route('/:quizName/results', {
	controller: BlockingRouteController,
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		if (localData.containsHashtag(Router.current().params.quizName)) {
			this.render('gamificationAnimation', {to: 'global.gamificationAnimation'});
		}
		this.render('liveResultsTitle', {to: 'header.title'});
		this.render('liveResultsFooterNavButtons', {to: 'footer.navigation'});
		this.render('live_results');
	}
});

Router.route('/:quizName/leaderBoard/:id', {
	controller: BlockingRouteController,
	waitOn: function () {
		Meteor.subscribe('AllAttendeeUsersList', Router.current().params.quizName, localData.getPrivateKey());
	},
	action: function () {
		if (!globalEventStackObserver.isRunning()) {
			globalEventStackObserver.startObserving(Router.current().params.quizName);
		}
		this.render('leaderboardTitle', {to: 'header.title'});
		this.render('leaderboardFooterNavButtons', {to: 'footer.navigation'});
		this.render('leaderBoard');
	}
});
