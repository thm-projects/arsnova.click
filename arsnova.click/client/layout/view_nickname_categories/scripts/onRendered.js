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
import {Tracker} from 'meteor/tracker';
import {calculateHeaderSize} from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as lib from './lib.js';

Template.nicknameCategories.onRendered(function () {
	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);

	$(document.getElementById('nickCategory_' + Session.get("selectedCategory"))).addClass("selectedCategory");

	lib.formatBootstrapSwitch();
	lib.setFormatBootstrapSwitchTracker(Tracker.autorun(function () {
		if (Session.get("questionGroup").getConfiguration().getNickSettings().getSelectedValues().length === 0) {
			setTimeout(function () {
				lib.formatBootstrapSwitch();
			}, 30);
		}
	}));

	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	footerElements.calculateFooter();
});
