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
import {Router} from 'meteor/iron:router';
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {getTooltipForRoute} from "/client/layout/global/scripts/lib.js";
import {markdownBarTracker} from '/client/plugins/markdown_bar/scripts/lib.js';
import * as lib from './lib.js';

Template.createQuestionView.onRendered(function () {
	this.autorun(function () {
		headerLib.titelTracker.depend();
		const mainContentContainer = $('#mainContentContainer');
		const previewQuestionImage = $('#previewQuestionImage');
		$('.textarea').css("height", mainContentContainer.height() - $('#markdownBarDiv').outerHeight(true) - 6);
		previewQuestionImage.css("height", mainContentContainer.height());
		const contentWidth = (previewQuestionImage.width() ? previewQuestionImage.width() : previewQuestionImage.height() / 1.7758186397984888);
		$('#markdownPreviewWrapper').css({
			height: previewQuestionImage.height() - 140,
			width: contentWidth
		});
		$('#previewQuestionContentWrapper').find('.center-block').css({width: contentWidth});
	}.bind(this));
	this.autorun(function () {
		markdownBarTracker.depend();
		lib.addQuestion(parseInt(Router.current().params.questionIndex));
	}.bind(this));

	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
	getTooltipForRoute();
});
