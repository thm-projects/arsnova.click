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
import {Blaze} from 'meteor/blaze';
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import {TAPi18n} from 'meteor/tap:i18n';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {forceFeedback} from '/client/layout/global/scripts/lib.js';
import * as questionLib from '/client/layout/view_questions/scripts/lib.js';
import * as localData from '/lib/local_storage.js';

export function closeSplashscreen() {
	const qrCodeContainer = $('.qr-code-container');
	if (qrCodeContainer.is(":visible")) {
		qrCodeContainer.hide();
	} else {
		$(".splashscreen").remove();
		$('.modal-backdrop').remove();
		forceFeedback();
	}
}

/**
 * This class will construct an empty splashscreen which can be modified via JQuery.
 *
 * Since ES6 does not support destructors you'll need to manually call the destroy() method on the splashscreen if you
 * registered any root-level event listeners. You can pass the event removing calls to the onDestroyed option.
 *
 * Valid construction parameters are:
 * - autostart	  -> True, if the splashscreen should show as soon as it has been rendered
 * - templateName   -> The Meteor Template which is used to display the splashscreen
 * - instanceId	 -> If you define and display multiple splashscreens of the same template on one page you'll need to give each of them unique id's
 * - closeOnButton  -> A valid jQuery selector which shall trigger the close event. A click on the modal or the splashscreen itself will not trigger the close event if this option is set.
 * - onCreated	  -> Callback function which is called with the current instance as argument when the splashscreen is created
 * - onRendered	 -> Callback function which is called with the current instance as argument when the splashscreen template is rendered
 * - onDestroyed	-> Callback function which is called with the current instance as argument when the splashscreen template is destroyed
 *
 * Read-Only members are:
 * - templateInstance   -> The Blaze template object
 * - templateSelector   -> The jQuery object of the current splashscreen template
 * - isCreated		  -> True, if the Splashscreen object has been created
 * - isRendered		 -> True, if the Splashscreen template has been rendered
 */
export class Splashscreen {
	/**
	 * Constructs and returns a new instance of Splashscreen
	 *
	 * @param options Must be an object with optional parameters
	 */
	constructor (options) {
		this.options = {
			autostart: options.autostart || false,
			templateName: options.templateName || "splashscreen",
			dataContext: options.dataContext || {},
			instanceId: options.instanceId || 0,
			closeOnButton: options.closeOnButton || false,
			onCreated: options.onCreated || undefined,
			onDestroyed: options.onDestroyed || undefined,
			onRendered: options.onRendered || undefined
		};
		this.templateInstance = null;
		this.templateSelector = null;
		this.created();
		this.isCreated = true;

		let duplicateEntry = $('#' + this.options.templateName + "_" + this.options.instanceId);
		if (duplicateEntry.length > 0) {
			duplicateEntry.remove();
			$('.modal-backdrop').remove();
		}

		this.rendered();
		this.isRendered = true;

		$(document).on('keyup',function (event) {
			if (event.keyCode === 27) {
				closeSplashscreen(event);
			}
		});
	}

	/**
	 * This method will be called after the options have been parsed by the constructor
	 * If a callback to options.onCreated has been specified this method will run the callback
	 */
	created () {
		if (typeof this.options.onCreated === "function") {
			this.options.onCreated(this);
		}
	}

	/**
	 * This method will be called after the created method
	 * If a callback to options.onRendered has been specified this method will run the callback
	 */
	rendered () {
		let template = Template[this.options.templateName];
		if (!template) {
			throw new Error('Invalid template name');
		}

		this.templateInstance = Blaze.renderWithData(Template[this.options.templateName], this.options.dataContext, document.getElementById("theme-wrapper"));
		$(this.templateInstance.firstNode()).addClass(this.options.templateName).attr("id", this.options.templateName + "_" + this.options.instanceId);
		this.templateSelector = $(this.templateInstance.firstNode());

		this.isOpen = this.options.autostart;
		if (this.isOpen) {
			this.open();
		}

		if (typeof this.options.onRendered === "function") {
			this.options.onRendered(this);
		}
	}

	/**
	 * This method must be called manually
	 * If a callback to options.onDestroyed has been specified this method will run the callback
	 */
	destroy () {
		if (!this.templateInstance) {
			return;
		}
		Blaze.remove(this.templateInstance);
		this.templateSelector.remove();
		$('.modal-backdrop').remove();
		this.templateInstance = null;
		if (typeof this.options.onDestroyed === "function") {
			this.options.onDestroyed(this);
		}
	}

	/**
	 * A call of this method will close (hide) the splashscreen
	 */
	close () {
		this.templateSelector.off('hide.bs.modal').off('click', this.options.closeOnButton);
		this.templateSelector.modal("hide");
		this.isOpen = false;
		this.destroy();
	}

	/**
	 * A call of this method will show (display) the splashscreen
	 */
	open () {
		let self = this;
		if (self.options.closeOnButton) {
			let hasClickedOnCloseButton = false;
			self.templateSelector.on('hide.bs.modal', function (event) {
				if (!hasClickedOnCloseButton) {
					event.stopPropagation();
					event.preventDefault();
					self.close();
				}
			});

			self.templateSelector.find('.modal-dialog').on('click', self.options.closeOnButton, function () {
				hasClickedOnCloseButton = true;
				self.close();
			});
		} else {
			self.templateSelector.on('hide.bs.modal', function () {
				self.close();
			});
		}

		self.templateSelector.modal("show");
		self.isOpen = true;
	}
}


export class ErrorSplashscreen extends Splashscreen {
	constructor (options) {
		options.templateName = "errorSplashscreen";
		options.closeOnButton = "#js-btn-hideErrorMessageModal";
		super(options);

		if (!options.errorMessage) {
			throw new Error('Invalid error message');
		}
		this.setErrorText(options.errorMessage);
	}

	setErrorText (text) {
		if (this.isRendered) {
			$(this.templateSelector).find(".modal-header>h2").text(TAPi18n.__("plugins.splashscreen.error.title"));
			$(this.templateSelector).find(".modal-body").text(TAPi18n.__(text));
		} else {
			throw new Error(TAPi18n.__("plugins.splashscreen.error.set_text_error"));
		}
	}
}

export function showReadingConfirmationSplashscreen(index) {
	Session.set("showingReadingConfirmation", true);
	var questionDoc = QuestionGroupCollection.findOne();
	new Splashscreen({
		autostart: true,
		templateName: 'readingConfirmedSplashscreen',
		dataContext: {
			questionIndex: index
		},
		closeOnButton: '#setReadConfirmed, .splashscreen-container-close',
		onRendered: function (instance) {
			if (localData.containsHashtag(Router.current().params.quizName)) {
				instance.templateSelector.find('#setReadConfirmed').text(TAPi18n.__("global.close_window"));
			} else {
				instance.templateSelector.find('#setReadConfirmed').parent().on('click', '#setReadConfirmed', function () {
					Meteor.call("MemberListCollection.setReadConfirmed", {
						hashtag: Router.current().params.quizName,
						questionIndex: index,
						nick: localStorage.getItem(Router.current().params.quizName + "nick")
					}, (err)=> {
						if (err) {
							new ErrorSplashscreen({
								autostart: true,
								errorMessage: "plugins.splashscreen.error.error_messages." + err.reason
							});
						}
						Session.set("showingReadingConfirmation", undefined);
					});
				});
			}
		}
	});
}

export const isMobileDevice = {
	isMobileDevice: function () {
		return $(window).width() < 1024;
	}
};

export const parseMarkdown = {
	splitQuestionTextOnNewLine: function () {
		const instance = Template.instance();
		if (!Session.get("questionGroup")) {
			return;
		}
		const result = Session.get("questionGroup").getQuestionList()[parseInt(instance.data.questionIndex)].getQuestionText().split("\n");
		questionLib.parseGithubFlavoredMarkdown(result);
		return result;
	},
	answerOptionLetter: function (number) {
		return String.fromCharCode(number + 65);
	},
	isFreeTextQuestion: function () {
		const instance = Template.instance();
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[parseInt(instance.data.questionIndex)].typeName() === "FreeTextQuestion";
	},
	isRangedQuestion: function () {
		const instance = Template.instance();
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[parseInt(instance.data.questionIndex)].typeName() === "RangedQuestion";
	},
	getAnswerOptions: function () {
		const instance = Template.instance();
		if (!Session.get("questionGroup")) {
			return;
		}
		const question = Session.get("questionGroup").getQuestionList()[parseInt(instance.data.questionIndex)];
		if (question.typeName() === "RangedQuestion") {
			return [question.getMinRange(), question.getCorrectValue(), question.getMaxRange()];
		}
		const result = question.getAnswerOptionList().map(function (elem) {
			return elem.getAnswerText();
		});
		questionLib.parseGithubFlavoredMarkdown(result);
		return result;
	},
	isVideoQuestionText: function (questionText) {
		return !/(^!)?\[.*\]\(.*\)/.test(questionText) && /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/.test(questionText) && (/youtube/.test(questionText) || /youtu.be/.test(questionText) || /vimeo/.test(questionText));
	},
	getVideoData: function (questionText) {
		const result = {};
		if (/youtube/.test(questionText)) {
			result.origin  = "https://www.youtube.com/embed/";
			result.videoId = questionText.substr(questionText.lastIndexOf("=") + 1, questionText.length);
		} else if (/youtu.be/.test(questionText)) {
			result.origin  = "https://www.youtube.com/embed/";
			result.videoId = questionText.substr(questionText.lastIndexOf("/") + 1, questionText.length);
		} else if (/vimeo/.test(questionText)) {
			result.origin = "https://player.vimeo.com/video/";
			result.videoId = questionText.substr(questionText.lastIndexOf("/") + 1, questionText.length);
		}
		result.videoId = result.videoId.replace(/script/g, "");
		result.embedTag = '<embed width="100%" height="200px" src="' + result.origin + result.videoId + '?html5=1&amp;rel=0&amp;hl=en_US&amp;version=3" type="text/html" allowscriptaccess="always" allowfullscreen="true" />';
		return result;
	}
}

export function showFullscreenPicture(event) {
	var pictureElement = event.target;
	var src = pictureElement.src;
	var title = pictureElement.title;

	new Splashscreen({
		autostart: true,
		templateName: 'questionPreviewSplashscreen',
		closeOnButton: '#js-btn-hidePreviewModal, .splashscreen-container-close',
		instanceId: "resizeableImage",
		onRendered: function (instance) {
			var body = instance.templateSelector.find('.modal-markdown-body');
			var objectHtml =  '<img title="' + title + '" src="' + src + '" alt="' + title + '" style="width: 100%">';
			body.append(objectHtml);
		}
	});
}
