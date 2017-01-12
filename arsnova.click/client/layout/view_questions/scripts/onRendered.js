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
		const content = $('#content');
		$('.textarea').css("height", mainContentContainer.height() - $('#markdownBarDiv').outerHeight(true) - 6);
		content.css("height", mainContentContainer.height());
		const contentWidth = ((content.height() / 1.8805970149253732) + 10);
		$('#previewQuestionContentWrapper').find('.center-block').css({width: contentWidth});
		content.css({"font-size": "50px"});
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
