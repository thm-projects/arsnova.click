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
import {TAPi18n} from 'meteor/tap:i18n';
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
		if (!markdownAlreadyExistsAndAutoRemove('[' + TAPi18n.__("plugins.markdown_bar.visible_text") + '](' + TAPi18n.__("plugins.markdown_bar.link_destination") + ')')) {
			insertInQuestionText('[' + TAPi18n.__("plugins.markdown_bar.visible_text") + '](' + TAPi18n.__("plugins.markdown_bar.link_destination") + ')');
		}
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
	},
	"click #imageMarkdownButton": function () {
		new Splashscreen({
			autostart: true,
			templateName: "pictureInsertSplashscreen",
			closeOnButton: "#js-btn-closePicture, #js-btn-savePicture",
			onRendered: function (instance) {
				const textarea = document.getElementById('questionText');
				if (textarea.selectionStart != textarea.selectionEnd) {
					const strPosBegin = textarea.selectionStart;
					const strPosEnd = textarea.selectionEnd;
					const frontText = (textarea.value).substring(0, strPosBegin);
					const middleText = (textarea.value).substring(strPosBegin, strPosEnd);
					const backText = (textarea.value).substring(strPosEnd, textarea.value.length);

					instance.templateSelector.find('#hyperlinkText').val(middleText);
					textarea.value = frontText + backText;
				}

				$('#js-btn-savePicture').on('click', function () {
					const linkText = document.getElementById('pictureText').value;
					const linkDestination = document.getElementById('pictureDestination').value;
					try {
						new SimpleSchema({
							hyperlink: urlSchema
						}).validate({hyperlink: linkDestination});

						insertInQuestionText('![' + linkText + '](' + linkDestination + ')');
					} catch (ex) {
						new ErrorSplashscreen({
							autostart: true,
							errorMessage: "plugins.splashscreen.error.error_messages.invalid_input_data"
						});
					}
				});
			}
		});
	}
});
