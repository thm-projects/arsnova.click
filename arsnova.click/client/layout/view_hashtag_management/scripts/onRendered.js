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
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";

Template.hashtagView.onRendered(function () {
	if ($(window).width() >= 992) {
		$('#hashtag-input-field').focus();
	}
});

Template.hashtagManagement.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	footerElements.addFooterElement(footerElements.footerElemImport);
	footerElements.addFooterElement(footerElements.footerElemImprint);
	footerElements.addFooterElement(footerElements.footerElemTranslation);
	footerElements.addFooterElement(footerElements.footerElemTheme);
	footerElements.addFooterElement(footerElements.footerElemFullscreen);
	footerElements.calculateFooter();
});
