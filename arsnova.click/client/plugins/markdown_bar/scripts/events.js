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

import {Template} from 'meteor/templating';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Splashscreen, ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {markdownAlreadyExistsAndAutoRemove, insertInQuestionText, urlSchema} from './lib.js';

Template.markdownBar.events({
	"click #boldMarkdownButton": function () {
		if (!markdownAlreadyExistsAndAutoRemove('**', '**')) {
			insertInQuestionText('**', '**');
		}
	},
	"click #italicMarkdownButton": function () {
		if (!markdownAlreadyExistsAndAutoRemove('*', '*')) {
			insertInQuestionText('*', '*');
		}
	},
	"click #lineThroughMarkdownButton": function () {
		if (!markdownAlreadyExistsAndAutoRemove('<del>', '</del>')) {
			insertInQuestionText('<del>', '</del>');
		}
	},
	"click #headerMarkdownButton": function () {
		if (!markdownAlreadyExistsAndAutoRemove('###', '')) {
			if (markdownAlreadyExistsAndAutoRemove('##', '')) {
				insertInQuestionText('###', '');
			} else {
				if (markdownAlreadyExistsAndAutoRemove('#', '')) {
					insertInQuestionText('##', '');
				} else {
					insertInQuestionText('#', '');
				}
			}
		}
	},
	"click #hyperlinkMarkdownButton": function () {
		new Splashscreen({
			autostart: true,
			templateName: "hyperlinkInsertSplashscreen",
			closeOnButton: "#js-btn-closeHyperlink, #js-btn-saveHyperlink, .splashscreen-container-close",
			onRendered: function (instance) {
				const textarea = document.getElementById('questionText');
				let frontText;
				let middleText;
				let backText;
				if (textarea.selectionStart != textarea.selectionEnd) {
					const strPosBegin = textarea.selectionStart;
					const strPosEnd = textarea.selectionEnd;
					frontText = (textarea.value).substring(0, strPosBegin);
					middleText = (textarea.value).substring(strPosBegin, strPosEnd);
					backText = (textarea.value).substring(strPosEnd, textarea.value.length);

					instance.templateSelector.find('#hyperlinkText').val(middleText);
				}
				$('#js-btn-saveHyperlink').on('click', function () {
					const linkText = document.getElementById('hyperlinkText').value;
					const linkDestination = document.getElementById('hyperlinkDestination').value;
					try {
						new SimpleSchema({
							hyperlink: urlSchema
						}).validate({hyperlink: linkDestination});
						textarea.value = frontText + backText;
						insertInQuestionText('[' + linkText + '](' + linkDestination + ')');
					} catch (ex) {
						new ErrorSplashscreen({
							autostart: true,
							errorMessage: "plugins.splashscreen.error.error_messages.invalid_input_data"
						});
					}
				});
			}
		});
	},
	"click #unsortedListMarkdownButton": function () {
		if (!markdownAlreadyExistsAndAutoRemove('- ')) {
			insertInQuestionText('- ');
		}
	},
	"click #sortedListMarkdownButton": function () {
		if (!markdownAlreadyExistsAndAutoRemove('1. ')) {
			insertInQuestionText('1. ');
		}
	},
	"click #latexMarkdownButton": function () {
		if (!markdownAlreadyExistsAndAutoRemove('$$', '$$')) {
			if (!markdownAlreadyExistsAndAutoRemove('$', '$')) {
				insertInQuestionText('$$', '$$');
			}
		} else {
			insertInQuestionText('$', '$');
		}
	},
	"click #codeMarkdownButton": function () {
		if (!markdownAlreadyExistsAndAutoRemove('```\n', '\n```')) {
			insertInQuestionText('```\n', '\n```');
		}
	},
	"click #commentMarkdownButton": function () {
		if (!markdownAlreadyExistsAndAutoRemove('> ')) {
			insertInQuestionText('> ');
		}
	}
});
