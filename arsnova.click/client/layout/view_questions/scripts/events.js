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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as lib from './lib.js';

Template.createQuestionView.events({
	'input #questionText': function () {
		lib.addQuestion(EventManagerCollection.findOne().questionIndex);
		lib.checkForValidQuestionText();
	},
	'change #chooseQuestionType': function () {
		lib.addQuestion(EventManagerCollection.findOne().questionIndex);
	},
	//Save question in Sessions-Collection when Button "Next" is clicked
	'click #forwardButton': function () {
		lib.addQuestion(EventManagerCollection.findOne().questionIndex);
		Router.go("/" + Router.current().params.quizName + "/answeroptions");
	},
	"click #backButton": function () {
		Router.go("/" + Router.current().params.quizName + "/resetToHome");
	}
});
