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
import {TAPi18n} from 'meteor/tap:i18n';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {DefaultQuestionGroup} from '/lib/questions/questiongroup_default.js';
import * as localData from '/lib/local_storage.js';
import * as hashtagLib from '/client/layout/view_hashtag_management/scripts/lib.js';
import {buzzsound1, setBuzzsound1, lobbySound, setLobbySound} from '/client/plugins/sound/scripts/lib.js';
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
		Router.go("/theme");
	},
	"click #hashtagManagement": function () {
		Router.go("/hashtagmanagement");
	},
	"click #home": function () {
		if (Router.current().params.quizName) {
			if (localData.containsHashtag(Router.current().params.quizName)) {
				if (Session.get("soundIsPlaying")) {
					buzzsound1.stop();
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
		var route = Router.current().route.getName();
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
			var fileList = importButton[0].files;
			var fileReader = new FileReader();
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
								var hashtag = $("#hashtagRename-input-field").val().trim();
								var hashtagDoc = HashtagsCollection.findOne({hashtag: hashtag});
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
								var inputHashtag = $(event.target).val();
								if (["?", "/", "\\"].some(function (v) { return inputHashtag.indexOf(v) >= 0; })) {
									$("#js-btn-importSession").attr("disabled", "disabled");
									return;
								}
								if (hashtagLib.trimIllegalChars(inputHashtag).length === 0) {
									$("#js-btn-importSession").attr("disabled", "disabled");
									return;
								}
								var hashtagDoc = HashtagsCollection.findOne({hashtag: inputHashtag});
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
			for (var i = 0; i < fileList.length; i++) {
				fileReader.readAsText(fileList[i], "UTF-8");
			}
		});
	},
	'click #sound': function () {
		new Splashscreen({
			autostart: true,
			templateName: "soundConfig",
			closeOnButton: "#js-btn-hideSoundModal, .splashscreen-container-close",
			onRendered: function (instance) {
				instance.templateSelector.find('#soundSelect').on('change', function (event) {
					var configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
					configDoc.music.title = $(event.target).val();
					if (Session.get("soundIsPlaying")) {
						buzzsound1.stop();
						setBuzzsound1($(event.target).val());
						buzzsound1.play();
					} else {
						setBuzzsound1($(event.target).val());
					}
					Meteor.call('SessionConfiguration.setMusic', configDoc);
					const questionItem = Session.get("questionGroup");
					questionItem.getConfiguration().getMusicSettings().setTitle($(event.target).val());
					Session.set("questionGroup", questionItem);
					localData.addHashtag(Session.get("questionGroup"));
				});
				instance.templateSelector.find('#lobbySoundSelect').on('change', function (event) {
					if (Session.get("lobbySoundIsPlaying")) {
						lobbySound.stop();
						setLobbySound($(event.target).val());
						lobbySound.play();
					} else {
						setLobbySound($(event.target).val());
					}
				});

				instance.templateSelector.find("#js-btn-playStopMusic").on('click', function () {
					if (Session.get("soundIsPlaying")) {
						buzzsound1.stop();
						Session.set("soundIsPlaying", false);
						$('#js-btn-playStopMusic').toggleClass("down").removeClass("button-warning").addClass("button-success");
					} else {
						buzzsound1.play();
						Session.set("soundIsPlaying", true);
						$('#js-btn-playStopMusic').toggleClass("down").removeClass("button-success").addClass("button-warning");
					}
				});

				const checkLobbySoundPlaying = function () {
					if (Session.get("lobbySoundIsPlaying")) {
						lobbySound.stop();
						Session.set("lobbySoundIsPlaying", false);
						$('#playStopLobbyMusic').toggleClass("down").removeClass("button-warning").addClass("button-success");
					} else {
						lobbySound.play();
						Session.set("lobbySoundIsPlaying", true);
						$('#playStopLobbyMusic').toggleClass("down").removeClass("button-success").addClass("button-warning");
					}
				};
				checkLobbySoundPlaying();
				instance.templateSelector.find("#playStopLobbyMusic").on('click', checkLobbySoundPlaying);

				instance.templateSelector.find("#js-btn-hideSoundModal").on('click', function () {
					buzzsound1.stop();
					Session.set("soundIsPlaying", false);
				});

				instance.templateSelector.find('#isSoundOnButton').on('click', function () {
					var configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
					var btn = $('#isSoundOnButton');
					btn.toggleClass("down");
					if (btn.hasClass("down")) {
						configDoc.music.isEnabled = true;
						btn.html(TAPi18n.__("plugins.sound.active"));
					} else {
						configDoc.music.isEnabled = false;
						btn.html(TAPi18n.__("plugins.sound.inactive"));
					}
					Meteor.call('SessionConfiguration.setMusic', configDoc);
					const questionItem = Session.get("questionGroup");
					questionItem.getConfiguration().getMusicSettings().setEnabled(configDoc.music.isEnabled);
					Session.set("questionGroup", questionItem);
					localData.addHashtag(Session.get("questionGroup"));
				});
			},
			onDestroyed: function () {
				var configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
				configDoc.music.volume = Session.get("slider2");
				Meteor.call('SessionConfiguration.setMusic', configDoc);
				const questionItem = Session.get("questionGroup");
				questionItem.getConfiguration().getMusicSettings().setVolume(configDoc.music.volume);
				Session.set("questionGroup", questionItem);
				localData.addHashtag(Session.get("questionGroup"));
			}
		});
	},
	"click #qr-code": function () {
		const url = window.location.protocol + "//" + window.location.host + "/" + Router.current().params.quizName;
		const qrCodeContainer = $(".qr-code-container");
		const qrCodeSize = function () {
			const height = $(window).outerHeight() - $('.navbar-fixed-top').outerHeight() - $('.navbar-fixed-bottom').outerHeight();
			return height * 0.9;
		};
		const calcQrCodeContainerSize = function () {
			qrCodeContainer.find("canvas").remove();
			var img = new window.Image();
			img.addEventListener("load", function () {
				qrCodeContainer.find(".qr-code-item").qrcode({
					background: "white",
					size: qrCodeSize(),
					text: url,
					quiet: 1,
					mode: 4,
					minVersion: 6,
					mSize: 0.3,
					ecLevel: 'H',
					image: img
				});
			});
			img.setAttribute("src", "/images/icons/arsNovaClick-192.png");
			qrCodeContainer.css({
				top: $('.navbar-fixed-top').outerHeight(),
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
					Meteor.call("MemberListCollection.removeFromSession", Router.current().params.quizName);
					Meteor.call('EventManagerCollection.setSessionStatus', Router.current().params.quizName, 1);
					Router.go("/" + Router.current().params.quizName + "/question");
				});
			}
		});
	},
	"click #reading-confirmation": function () {
		const elem = $('#reading-confirmation').find(".footerElemIcon").find(".glyphicon");
		const questionGroup = Session.get("questionGroup");
		if (elem.hasClass("glyphicon-eye-open")) {
			elem.removeClass("glyphicon-eye-open").addClass("glyphicon-eye-close");
			questionGroup.getConfiguration().setReadingConfirmationEnabled(false);
		} else {
			elem.removeClass("glyphicon-eye-close").addClass("glyphicon-eye-open");
			questionGroup.getConfiguration().setReadingConfirmationEnabled(true);
		}
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(questionGroup);
		Meteor.call("SessionConfiguration.setReadingConfirmationEnabled",
			Session.get("questionGroup").getHashtag(),
			Session.get("questionGroup").getConfiguration().getReadingConfirmationEnabled()
		);
	}
};

Template.footer.events($.extend({}, clickEvents, {
	"click #show-more": function () {
		Router.go("/" + Router.current().params.quizName + "/showMore");
	},
	"mouseenter .navbar-footer-placeholder": function () {
		var route = Router.current().route.getName();
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
		var route = Router.current().route.getName();
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
		var route = Router.current().route.getName();
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
				Meteor.call("MemberListCollection.removeFromSession", Router.current().params.quizName);
				Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, 0);
				Meteor.call("EventManagerCollection.setSessionStatus", Router.current().params.quizName, 2);
				Meteor.call('SessionConfiguration.addConfig', Session.get("questionGroup").getConfiguration().serialize());
				Meteor.call("QuestionGroupCollection.persist", Session.get("questionGroup").serialize());
				if (Session.get("questionGroup").getConfiguration().getNickSettings().getRestrictToCASLogin()) {
					Meteor.loginWithCas(function () {
						Router.go("/" + Router.current().params.quizName + "/memberlist");
					});
				} else {
					Router.go("/" + Router.current().params.quizName + "/memberlist");
				}
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
		var route = Router.current().route.getName();
		if (typeof route === "undefined") {
			return;
		}
		route = route.replace(/(:quizName.)*(.:id)*/g, "");
		switch (route) {
			case "hashtagmanagement":
			case "agb":
			case "about":
			case "imprint":
			case "dataprivacy":
				Router.go("/");
				break;
			case "question":
				Router.go("/" + Router.current().params.quizName + "/resetToHome");
				break;
			case "answeroptions":
				Router.go("/" + Router.current().params.quizName + "/question");
				break;
			case "settimer":
				Router.go("/" + Router.current().params.quizName + "/answeroptions");
				break;
			case "quizSummary":
				let firstFailedIndex = null;
				Session.get("questionGroup").getQuestionList().forEach(function (questionItem) {
					if (!firstFailedIndex && !questionItem.isValid()) {
						firstFailedIndex = questionItem.getQuestionIndex();
					}
				});
				if (firstFailedIndex) {
					Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, firstFailedIndex);
					Router.go("/" + Router.current().params.quizName + "/question");
				} else {
					Router.go("/" + Router.current().params.quizName + "/settimer");
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
