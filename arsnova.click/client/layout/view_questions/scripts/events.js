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
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as lib from './lib.js';

Template.createQuestionView.events({
	'input #questionText': function () {
		if (!EventManagerCollection.findOne()) {
			return;
		}
		lib.addQuestion(EventManagerCollection.findOne().questionIndex);
	},
	//Save question in Sessions-Collection when Button "Next" is clicked
	'click #forwardButton': function () {
		if (!EventManagerCollection.findOne()) {
			return;
		}
		lib.addQuestion(EventManagerCollection.findOne().questionIndex);
		Router.go("/" + Router.current().params.quizName + "/answeroptions");
	},
	"click #backButton": function () {
		Router.go("/");
	},
	"click #formatPreviewButton": function () {
		var formatPreviewText = $('#formatPreviewText');
		if (formatPreviewText.text() === TAPi18n.__("view.questions.edit")) {
			lib.changePreviewButtonText(TAPi18n.__("view.questions.format"));
			$('#previewQuestionText').hide();
			$('#editQuestionText').show();
		} else if (formatPreviewText.text() === TAPi18n.__("view.questions.format")) {
			lib.changePreviewButtonText(TAPi18n.__("view.questions.preview"));
		} else {
			new Splashscreen({
				autostart: true,
				templateName: "questionPreviewSplashscreen",
				closeOnButton: '#js-btn-hidePreviewModal',
				onRendered: function (instance) {
					mathjaxMarkdown.initializeMarkdownAndLatex();
					let content = mathjaxMarkdown.getContent($('#questionText').val());
					instance.templateSelector.find('.modal-body').html(content).find('p').css("margin-left", "0px");
				}
			});
		}
	}
});
