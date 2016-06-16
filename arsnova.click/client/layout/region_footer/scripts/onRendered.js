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
import {calculateHeaderSize} from '/client/layout/region_header/lib.js';
import * as footerElements from "./lib.js";

Template.footer.onRendered(function () {
	footerElements.calculateFooter();

	$('.navbar-footer').on("click", '#reading-confirmation', function () {
		/*
		Since the functionality is currently not implemented the state is set to enabled!

		const elem = $('#reading-confirmation').find(".footerElemIcon").find(".glyphicon");
		if (elem.hasClass("glyphicon-eye-open")) {
			elem.removeClass("glyphicon-eye-open").addClass("glyphicon-eye-close");
		} else {
			elem.removeClass("glyphicon-eye-close").addClass("glyphicon-eye-open");
		}
		*/
	});
});

Template.showMore.onRendered(function () {
	$("[name='switch']").bootstrapSwitch({
		size: "small",
		onText: TAPi18n.__("region.footer.show-more.onText"),
		offText: TAPi18n.__("region.footer.show-more.offText")
	});
	footerElements.calculateFooter();
	footerElements.updateStatefulFooterElements.invalidate();
});

Template.contactHeaderBar.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	footerElements.addFooterElement(footerElements.footerElemTranslation);
	footerElements.addFooterElement(footerElements.footerElemTheme);
	footerElements.addFooterElement(footerElements.footerElemFullscreen);
	footerElements.addFooterElement(footerElements.footerElemImport);
	footerElements.calculateFooter();
});

Template.about.onRendered(function () {
	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);
});

Template.agb.onRendered(function () {
	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);
});

Template.dataprivacy.onRendered(function () {
	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);
});

Template.imprint.onRendered(function () {
	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);
});
