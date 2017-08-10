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

import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import {questionTextSchema} from '/lib/questions/collection.js';
import * as lib from './lib.js';

Template.createQuestionView.helpers({
	getQuestionTextSchema: questionTextSchema,
	questionText: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].getQuestionText();
	},
	splitQuestionTextOnNewLine: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		const result = Session.get("questionGroup").getQuestionList()[parseInt(Router.current().params.questionIndex)].getQuestionText().split("\n");
		lib.parseGithubFlavoredMarkdown(result);
		return result;
	},
	isVideoQuestionText: function (questionText) {
		return !/(^!)?\[.*\]\(.*\)/.test(questionText) && /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/.test(questionText) && (/youtube/.test(questionText) || /youtu.be/.test(questionText) || /vimeo/.test(questionText));
	},
	getVideoData: function (questionText) {
		const result = {};
		if (/youtube/.test(questionText)) {
			result.origin = "https://www.youtube.com/embed/";
			result.videoId = questionText.substr(questionText.lastIndexOf("=") + 1, questionText.length);
		} else if (/youtu.be/.test(questionText)) {
			result.origin = "https://www.youtube.com/embed/";
			result.videoId = questionText.substr(questionText.lastIndexOf("/") + 1, questionText.length);
		} else if (/vimeo/.test(questionText)) {
			result.origin = "https://player.vimeo.com/video/";
			result.videoId = questionText.substr(questionText.lastIndexOf("/") + 1, questionText.length);
		}
		result.videoId = result.videoId.replace(/script/g, "");
		result.embedTag = '<embed width="100%" height="200px" src="' + result.origin + result.videoId + '?html5=1&amp;rel=0&amp;hl=en_US&amp;version=3" type="text/html" allowscriptaccess="always" allowfullscreen="true" />';
		return result;
	},
	isLargeWindow: function () {
		return $(window).height() > 699;
	},
	questionTypes: function () {
		return lib.getQuestionTypes();
	}
});
