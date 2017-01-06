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
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {Router} from 'meteor/iron:router';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {DefaultQuestionGroup} from '/lib/questions/questiongroup_default.js';
import * as localData from '/lib/local_storage.js';
import * as hashtagLib from '/client/layout/view_hashtag_management/scripts/lib.js';
import {countdownRunningSound} from '/client/plugins/sound/scripts/lib.js';
import {Splashscreen, ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as questionLib from '/client/layout/view_questions/scripts/lib.js';

const clickEvents = {
	"click #about": function () {
		Router.go("/about");
	},
	"click #translation": function () {
		Router.go("/translate");
	},
	"click #theme": function () {
		if (Router.current().params.quizName) {
			Router.go("/" + Router.current().params.quizName + "/theme");
		} else {
			Router.go("/theme");
		}
	},
	"click #hashtagManagement": function () {
		Router.go("/hashtagmanagement");
	},
	"click #home": function () {
		if (Router.current().params.quizName) {
			if (localData.containsHashtag(Router.current().params.quizName)) {
				if (Session.get("soundIsPlaying")) {
					countdownRunningSound.stop();
				}
				new Splashscreen({
					autostart: true,
					templateName: "resetSessionSplashscreen",
					closeOnButton: '#closeDialogButton, #resetSessionButton, .splashscreen-container-close',
					onRendered: function (instance) {
						instance.templateSelector.find('#resetSessionButton').on('click', function () {
							Meteor.call("Main.killAll", Router.current().params.quizName);
							Router.go("/" + Router.current().params.quizName + "/resetToHome");
						});
					}
				});
			} else {
				Router.go("/" + Router.current().params.quizName + "/resetToHome");
			}
		} else {
			Router.go("/");
		}
	},
	"click #fullscreen, switchChange.bootstrapSwitch .bootstrap-switch-id-fullscreen_switch": function () {
		let route = Router.current().route.getName();
		if (route !== undefined) {
			route = route.replace(/(:quizName.)*(.:id)*/g, "");
		}

		if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
			if (document.cancelFullScreen) {
				document.cancelFullScreen();
			} else if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitFullscreenElement) {
				document.webkitCancelFullScreen();
			}

			if (route !== undefined && route === "memberlist") {
				$('.navbar-footer-placeholder').hide();
				$('.navbar-footer').show();
			}
		} else {
			if (document.documentElement.requestFullscreen) {
				document.documentElement.requestFullscreen();
			} else if (document.documentElement.mozRequestFullScreen) {
				document.documentElement.mozRequestFullScreen();
			} else if (document.documentElement.webkitRequestFullScreen) {
				document.documentElement.webkitRequestFullScreen();
			}

			if (route !== undefined && route === "memberlist") {
				$('.navbar-footer').hide();
				$('.navbar-footer-placeholder').show();
			}
		}
	},
	"click #import": function () {
		const importButton = $('.js-import-input-home');
		importButton.click();
		importButton[0].value = null;
		importButton.on("change", function () {
			const fileList = importButton[0].files;
			const fileReader = new FileReader();
			fileReader.onload = function () {
				let asJSON = null;
				try {
					asJSON = $.parseJSON(fileReader.result);
				} catch (ex) {
					new ErrorSplashscreen({
						autostart: true,
						errorMessage: "plugins.splashscreen.error.error_messages.invalid_data"
					});
					return;
				}
				let questionInstance = null;

				if (asJSON.type === "DefaultQuestionGroup") {
					questionInstance = new DefaultQuestionGroup(asJSON);
				} else {
					throw new TypeError("Undefined session type '" + asJSON.type + "' while importing");
				}

				if (!HashtagsCollection.findOne({hashtag: questionInstance.getHashtag()})) {
					Meteor.call('SessionConfiguration.addConfig', questionInstance.getConfiguration().serialize());
					Meteor.call('HashtagsCollection.addHashtag', {
						privateKey: localData.getPrivateKey(),
						hashtag: questionInstance.getHashtag()
					}, function (err) {
						if (err) {
							new ErrorSplashscreen({
								autostart: true,
								errorMessage: "plugins.splashscreen.error.error_messages.invalid_data"
							});
							return;
						}
						localData.addHashtag(questionInstance);
						if (Router.current().route.path() === "/hashtagmanagement") {
							location.reload();
						} else {
							Router.go("/hashtagmanagement");
						}
					});
				} else {
					new Splashscreen({
						autostart: true,
						templateName: "renameHashtagSplashscreen",
						closeOnButton: "#js-btn-closeRenameHashtag, #js-btn-importSession, .splashscreen-container-close",
						onRendered: function () {
							$('#js-btn-importSession').on('click', function () {
								const hashtag = $("#hashtagRename-input-field").val().trim();
								const hashtagDoc = HashtagsCollection.findOne({hashtag: hashtag});
								if (hashtagDoc) {
									return;
								}

								switch (asJSON.type) {
									case "DefaultQuestionGroup":
										questionInstance = new DefaultQuestionGroup(asJSON);
										break;
									default:
										throw new TypeError("Undefined session type '" + asJSON.type + "' while importing");
								}

								const oldSessionName = questionInstance.getHashtag();
								questionInstance.setHashtag(hashtag);
								Meteor.call('SessionConfiguration.addConfig', questionInstance.getConfiguration().serialize());
								Meteor.call('HashtagsCollection.addHashtag', {
									privateKey: localData.getPrivateKey(),
									hashtag: questionInstance.getHashtag()
								});
								localData.addHashtag(questionInstance);
								Meteor.call('EventManagerCollection.add', hashtag);
								if (oldSessionName === "ImportFromARSnova") {
									sessionStorage.setItem("overrideValidQuestionRedirect", true);
									hashtagLib.connectEventManager(hashtag);
								} else if (Router.current().route.path() === "/hashtagmanagement") {
									location.reload();
								} else {
									Router.go("/hashtagmanagement");
								}
							});
							$('#hashtagRename-input-field').on('input', function (event) {
								const inputHashtag = $(event.target).val();
								if (["?", "/", "\\"].some(function (v) { return inputHashtag.indexOf(v) >= 0; })) {
									$("#js-btn-importSession").attr("disabled", "disabled");
									return;
								}
								if (hashtagLib.trimIllegalChars(inputHashtag).length === 0) {
									$("#js-btn-importSession").attr("disabled", "disabled");
									return;
								}
								const hashtagDoc = HashtagsCollection.findOne({hashtag: inputHashtag});
								if (!hashtagDoc) {
									$("#js-btn-importSession").removeAttr("disabled");
								} else {
									$("#js-btn-importSession").attr("disabled", "disabled");
								}
							}).on('keydown', function (event) {
								if (event.keyCode === 13 && !$('#js-btn-importSession').is(':disabled')) {
									$('#js-btn-importSession').click();
								}
							});
						}
					});
				}
			};
			for (let i = 0; i < fileList.length; i++) {
				fileReader.readAsText(fileList[i], "UTF-8");
			}
		});
	},
	'click #sound': function () {
		new Splashscreen({
			autostart: true,
			templateName: "soundConfig",
			closeOnButton: "#js-btn-hideSoundModal, .splashscreen-container-close"
		});
	},
	"click #qr-code": function () {
		const url = window.location.protocol + "//" + window.location.host + "/" + Router.current().params.quizName;
		const qrCodeContainer = $(".qr-code-container");
		const qrCodeSize = function () {
			const height = $(window).outerHeight() - $('.navbar-fixed-bottom').outerHeight() - $('.quiz-lobby-header').outerHeight();
			return height * 0.9;
		};
		const calcQrCodeContainerSize = function () {
			qrCodeContainer.find("canvas").remove();
			const img = new window.Image();
			img.addEventListener("load", function () {
				qrCodeContainer.find(".qr-code-item").qrcode({
					background: "white",
					size: qrCodeSize(),
					text: url,
					quiet: 1,
					mode: 0,
					radius: 0,
					minVersion: 6,
					mSize: 0.3,
					ecLevel: 'H',
					image: img
				});
			});
			img.setAttribute("src", "/images/icons/arsnova_click-512.png");
			qrCodeContainer.css({
				top: $('.quiz-lobby-header').outerHeight(),
				left: $(window).outerWidth() / 2 - qrCodeSize() / 2
			});
			$('.qr-code-container-close').css("left", qrCodeSize() - 45);
			qrCodeContainer.show();
		};
		const windowResizeHandler = function () {
			calcQrCodeContainerSize();
		};
		$(window).on("resize", windowResizeHandler);
		calcQrCodeContainerSize();
		qrCodeContainer.on("click", function () {
			$(window).off("resize", windowResizeHandler);
			qrCodeContainer.hide();
		});
	},
	"click #nicknames": function () {
		Router.go("/" + Router.current().params.quizName + "/nicknameCategories");
	},
	"click #edit-quiz": function () {
		new Splashscreen({
			autostart: true,
			templateName: "editSessionSplashscreen",
			closeOnButton: '#closeDialogButton, #editSessionButton, .splashscreen-container-close',
			onRendered: function (instance) {
				instance.templateSelector.find('#editSessionButton').on('click', function () {
					Meteor.call("MemberListCollection.removeFromSession", Router.current().params.quizName, function () {
						Meteor.call('EventManagerCollection.reset', Router.current().params.quizName);
						Router.go("/" + Router.current().params.quizName + "/quizManager");
					});
				});
			}
		});
	},
	"click #reading-confirmation": function () {
		const questionGroup = Session.get("questionGroup");
		if (questionGroup.getConfiguration().getReadingConfirmationEnabled()) {
			questionGroup.getConfiguration().setReadingConfirmationEnabled(false);
		} else {
			questionGroup.getConfiguration().setReadingConfirmationEnabled(true);
		}
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(questionGroup);
		Meteor.call("SessionConfiguration.setReadingConfirmationEnabled",
			questionGroup.getHashtag(),
			questionGroup.getConfiguration().getReadingConfirmationEnabled()
		);
	}
};

Template.footer.events($.extend({}, clickEvents, {
	"click #show-more": function () {
		if (Router.current().params.quizName) {
			Router.go("/" + Router.current().params.quizName + "/showMore");
		} else {
			Router.go("/showMore");
		}
	},
	"mouseenter .navbar-footer-placeholder": function () {
		let route = Router.current().route.getName();
		if (typeof route === "undefined") {
			return;
		}
		route = route.replace(/(:quizName.)*(.:id)*/g, "");
		if (window.innerHeight == screen.height && route === "memberlist") {
			$('.navbar-footer-placeholder').hide();
			$('.navbar-footer').show();
		}
	},
	"mouseleave .navbar-footer": function () {
		let route = Router.current().route.getName();
		if (typeof route === "undefined") {
			return;
		}
		route = route.replace(/(:quizName.)*(.:id)*/g, "");
		if (window.innerHeight == screen.height && route === "memberlist") {
			$('.navbar-footer').hide();
			$('.navbar-footer-placeholder').show();
		}
	}
}));

Template.showMore.events($.extend({}, clickEvents, {
}));

Template.contactHeaderBar.events({
	"click #tos": function () {
		Router.go("/agb");
	},
	"click #about": function () {
		Router.go("/about");
	},
	"click #imprint": function () {
		Router.go("/imprint");
	},
	"click #data-privacy": function () {
		Router.go("/dataprivacy");
	},
	"click #blog": function () {
		window.open("https://arsnova.click/blog/");
	}
});

Template.about.events($.extend({}, {

}));

Template.agb.events($.extend({}, {

}));

Template.imprint.events($.extend({}, {

}));

Template.dataprivacy.events($.extend({}, {

}));

Template.footerNavButtons.events({
	'click #forwardButton': function () {
		let route = Router.current().route.getName();
		if (typeof route === "undefined") {
			return;
		}
		route = route.replace(/(:quizName.)*(.:id)*/g, "");
		switch (route) {
			case "question":
				questionLib.addQuestion(EventManagerCollection.findOne().questionIndex);
				Router.go("/" + Router.current().params.quizName + "/answeroptions");
				break;
			case "answeroptions":
				Router.go("/" + Router.current().params.quizName + "/settimer");
				break;
			case "settimer":
				Router.go("/" + Router.current().params.quizName + "/quizSummary");
				break;
			case "quizSummary":
			case "quizManager":
				Meteor.call("MemberListCollection.removeFromSession", Router.current().params.quizName);
				Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, 0);
				Meteor.call("EventManagerCollection.setSessionStatus", Router.current().params.quizName, 2);
				Meteor.call('SessionConfiguration.addConfig', Session.get("questionGroup").getConfiguration().serialize());
				Meteor.call("QuestionGroupCollection.persist", Session.get("questionGroup").serialize());
				Router.go("/" + Router.current().params.quizName + "/memberlist");
				break;
			case "results":
				break;
			case "onpolling":
				break;
			case "leaderBoard":
				break;
		}
	},
	"click #backButton": function () {
		let route = Router.current().route.getName();
		if (typeof route === "undefined") {
			return;
		}
		route = route.replace(/(:quizName.)*(.:id)*(.:questionIndex)*/g, "");
		switch (route) {
			case "hashtagmanagement":
			case "agb":
			case "about":
			case "imprint":
			case "dataprivacy":
				Router.go("/");
				break;
			case "quizManager":
				if (typeof Router.current().params.questionIndex !== "undefined") {
					Router.go("/" + Router.current().params.quizName + "/quizManager");
				} else {
					Router.go("/" + Router.current().params.quizName + "/resetToHome");
					Router.go("/hashtagmanagement");
				}
				break;
			case "question":
			case "answeroptions":
			case "settimer":
			case "questionType":
			case "translate":
				history.back();
				break;
			case "quizSummary":
				let firstFailedIndex = null;
				Session.get("questionGroup").getQuestionList().forEach(function (questionItem) {
					if (!firstFailedIndex && !questionItem.isValid()) {
						firstFailedIndex = questionItem.getQuestionIndex();
					}
				});
				if (!isNaN(firstFailedIndex)) {
					Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, parseInt(firstFailedIndex));
					Router.go("/" + Router.current().params.quizName + "/quizManager");
				} else {
					Router.go("/" + Router.current().params.quizName + "/quizManager");
				}
				break;
			case "results":
				break;
			case "onpolling":
				break;
			case "leaderBoard":
				break;
			case "nicknameCategories":
				if (Session.get("questionGroup")) {
					Meteor.call("SessionConfiguration.setConfig", Session.get("questionGroup").getConfiguration().serialize());
				}
				history.back();
				break;
			case "showMore":
				history.back();
				break;
			case "theme":
				if (Session.get("questionGroup")) {
					Router.go("/" + Session.get("questionGroup").getHashtag() + "/memberlist");
				} else {
					history.back();
				}
				break;
		}
	}
});
