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
import * as headerLib from '/client/layout/region_header/lib.js';

export const footerElemTranslation = {
	id: "translation",
	iconClass: "glyphicon glyphicon-globe",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.translation"
};
export const footerElemSound = {
	id: "sound",
	iconClass: "glyphicon glyphicon-music",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.sound"
};
export const footerElemReadingConfirmation = {
	id: "reading-confirmation",
	iconClass: "glyphicon glyphicon-ok",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.reading-confirmation",
	selectable: true
};
export const footerElemTheme = {
	id: "theme",
	iconClass: "glyphicon glyphicon-blackboard",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.theme"
};
export const footerElemImport = {
	id: "import",
	iconClass: "glyphicon glyphicon-import glyphicon-import-style",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.import"
};
export const footerElemFullscreen = {
	id: "fullscreen",
	iconClass: "glyphicon glyphicon-fullscreen",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.fullscreen",
	selectable: true
};
export const footerElemHome = {
	id: "home",
	iconClass: "glyphicon glyphicon-th-large",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.home"
};
export const footerElemImprint = {
	id: "imprint",
	iconClass: "glyphicon glyphicon-info-sign",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.imprint"
};
export const footerElemQRCode = {
	id: "qr-code",
	iconClass: "glyphicon glyphicon-qrcode",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.qr_code"
};
const footerElemShowMore = {
	id: "show-more",
	iconClass: "glyphicon glyphicon-menu-hamburger",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.show_more"
};
const footerElements = [];
const hiddenFooterElements = {
	selectable: [],
	linkable: []
};

export function generateFooterElements() {
	$.merge(footerElements, hiddenFooterElements.selectable);
	$.merge(footerElements, hiddenFooterElements.linkable);
	hiddenFooterElements.selectable.splice(0, hiddenFooterElements.selectable.length);
	hiddenFooterElements.linkable.splice(0, hiddenFooterElements.linkable.length);
	let maxElems = 4;
	if ($(document).width() >= 1200) {
		maxElems = 12;
	} else if ($(document).width() >= 992) {
		maxElems = 6;
	}
	const index = $.inArray(footerElemShowMore, footerElements);
	if (index > 0) {
		footerElements.splice(index, 1);
	}
	if (footerElements.length > maxElems) {
		for (let i = footerElements.length - 1; i >= maxElems - 1; i--) {
			hiddenFooterElements[footerElements[i].selectable ? "selectable" : "linkable"].push(footerElements[i]);
			footerElements.splice(i, 1);
		}
		addFooterElement(footerElemShowMore);
	}
	Session.set("footerElements", footerElements);
	Session.set("hiddenFooterElements", hiddenFooterElements);
	return footerElements;
}

export function addFooterElement(footerElement, priority = 100) {
	footerElements.splice(priority, 0, footerElement);
}

export function removeFooterElements() {
	footerElements.splice(0, footerElements.length);
	hiddenFooterElements.selectable.splice(0, hiddenFooterElements.selectable.length);
	hiddenFooterElements.linkable.splice(0, hiddenFooterElements.linkable.length);
	Session.set("footerElements", footerElements);
	Session.set("hiddenFooterElements", hiddenFooterElements);
}

export function calculateFooterFontSize() {
	let iconSize = "3vh", textSize = "2vh";
	const navbarFooter = $(".navbar-footer");
	const fixedBottom = $('.fixed-bottom');

	if ($(document).width() > $(document).height()) {
		iconSize = "2vw";
		textSize = "1vw";
	}
	$(".footerElementText").css("fontSize", textSize);
	navbarFooter.css({"fontSize": iconSize});
	fixedBottom.css("bottom", navbarFooter.height());
	fixedBottom.show();
	$("[name='switch']").bootstrapSwitch({size: "small"});
	headerLib.calculateTitelHeight();
	return {
		icon: iconSize,
		text: textSize
	}
}

export function calculateFooter() {
	$(window).on("resize", function () {
		generateFooterElements();
		Meteor.setTimeout(calculateFooterFontSize, 40);
	});
	generateFooterElements();
	Meteor.setTimeout(calculateFooterFontSize, 40);
}
