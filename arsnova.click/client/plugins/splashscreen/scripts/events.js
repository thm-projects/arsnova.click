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
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {Splashscreen, ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as hashtagLib from '/client/layout/view_hashtag_management/scripts/lib.js';
import * as nickLib from '/client/layout/view_choose_nickname/scripts/lib.js';
import * as localData from '/lib/local_storage.js';


Template.showHashtagsSplashscreen.events({
	"click .js-my-hash": function (event) {
		hashtagLib.hashtagSplashscreen.destroy();

		const promise = new Promise(function (resolve, reject) {
			if (Meteor.settings.public.maximumActiveQuizzes) {
				const currentActiveQuizzes = EventManagerCollection.find({sessionStatus: {$gt: 1}}).fetch();
				if (currentActiveQuizzes.length < Meteor.settings.public.maximumActiveQuizzes) {
					const passwordPromise = new Promise(function (passwordResolve, passwordReject) {
						if (Meteor.settings.public.quizCreationPassword) {
							new Splashscreen({
								autostart: true,
								templateName: "quizCreationPasswordSplashscreen",
								closeOnButton: "#js-btn-close, #js-btn-validatePassword, .splashscreen-container-close>.glyphicon-remove",
								onRendered: function (template) {
									$(template.templateSelector).find('#js-btn-validatePassword').on('click', function () {
										if ($(template.templateSelector).find('#password').val() === Meteor.settings.public.quizCreationPassword) {
											passwordResolve();
										} else {
											passwordReject();
										}
									});
								}
							});
						} else {
							passwordResolve();
						}
					});
					passwordPromise.then(function () {
						if (Meteor.settings.public.restrictQuizmastersToCASUsers) {
							Meteor.loginWithCas(function () {
								nickLib.hasTHMMail() ? resolve() : reject("plugins.splashscreen.error.error_messages.invalid_login");
							});
						} else {
							resolve();
						}
					}, function () {
						new ErrorSplashscreen({
							autostart: true,
							errorMessage: "plugins.splashscreen.error.error_messages.invalid_password"
						});
					});
				} else {
					reject("plugins.splashscreen.error.error_messages.maximum_quizzes_exceeded");
				}
			} else {
				if (Meteor.settings.public.restrictQuizmastersToCASUsers) {
					Meteor.loginWithCas(function () {
						nickLib.hasTHMMail() ? resolve() : reject("plugins.splashscreen.error.error_messages.invalid_login");
					});
				} else {
					resolve();
				}
			}
		});
		promise.then(function () {
			Session.set("questionGroup", localData.reenterSession($(event.currentTarget).text()));
			if (Session.get("questionGroup").isValid()) {
				sessionStorage.setItem("overrideValidQuestionRedirect", true);
			}
			hashtagLib.addHashtag(Session.get("questionGroup"));
		}, function (rejectReason) {
			new ErrorSplashscreen({autostart: true, errorMessage: rejectReason});
		});
	},
	"click #js-btn-showHashtagManagement": function () {
		hashtagLib.hashtagSplashscreen.destroy();
		Router.go("/hashtagmanagement");
	},
	"click #closeButton": function () {
		$('.showHashtagsSplashscreen').remove();
		$('.modal-backdrop').remove();
	}
});
