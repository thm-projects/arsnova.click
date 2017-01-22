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
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {getTooltipForRoute} from "/client/layout/global/scripts/lib.js";

Template.questionTypeView.onRendered(function () {
	const calculateRowHeight = function () {
		const questionTypeWrapper = $('.questionType').find(".wrapper");
		questionTypeWrapper.height("auto");
		const maxHeight = Math.max.apply(null, questionTypeWrapper.map(function () {
			return $(this).height();
		}).get());
		questionTypeWrapper.height(maxHeight);
	};
	$(window).on("resize",function () {
		calculateRowHeight();
	});
	Meteor.defer(function () {
		calculateRowHeight();
	});
	this.autorun(function () {
		footerElements.removeFooterElements();
		footerElements.addFooterElement(footerElements.footerElemHome);
		if ($(window).width() > 768) {
			footerElements.addFooterElement(footerElements.footerElemProductTour);
		}
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	}.bind(this));
	Meteor.defer(function () {
		if (localStorage.getItem("showProductTour") !== "false") {
			getTooltipForRoute();
		}
	});
});
