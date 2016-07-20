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
import {Tracker} from 'meteor/tracker';
import {TAPi18n} from 'meteor/tap:i18n';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import * as headerLib from '/client/layout/region_header/lib.js';

export const footerElemTranslation = {
	id: "translation",
	iconClass: "glyphicon glyphicon-globe",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.languages"
};
export const footerElemSound = {
	id: "sound",
	iconClass: "glyphicon glyphicon-music",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.sound"
};
export const footerElemReadingConfirmation = {
	id: "reading-confirmation",
	iconClass: "glyphicon glyphicon-eye-open",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.reading-confirmation",
	selectable: true
};
export const footerElemTheme = {
	id: "theme",
	iconClass: "glyphicon glyphicon-apple",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.style"
};
export const footerElemImport = {
	id: "import",
	iconClass: "glyphicon glyphicon-import glyphicon-import-style",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.import"
};
export const footerElemHashtagManagement = {
	id: "hashtagManagement",
	iconClass: "glyphicon glyphicon-cog",
	textClass: "footerElementText",
	textName: "view.hashtag_management.session_management"
};
export const footerElemFullscreen = {
	id: "fullscreen",
	iconClass: "glyphicon glyphicon-fullscreen",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.fullscreen"
};
export const footerElemHome = {
	id: "home",
	iconClass: "glyphicon glyphicon-home",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.home"
};
export const footerElemAbout = {
	id: "about",
	iconClass: "glyphicon glyphicon-info-sign",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.info"
};
export const footerElemQRCode = {
	id: "qr-code",
	iconClass: "glyphicon glyphicon-qrcode",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.qr_code"
};
export const footerElemNicknames = {
	id: "nicknames",
	iconClass: "glyphicon glyphicon-user",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.nicknames",
	selectable: true
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

export function addFooterElement(footerElement, priority = 100) {
	let hasItem = false;
	$.each(footerElements, function (index, item) {
		if (item.id === footerElement.id) {
			hasItem = true;
			return false;
		}
	});
	if (!hasItem) {
		footerElements.splice(priority, 0, footerElement);
	}
	setTimeout(function () {
		$('#' + footerElement.id).removeClass("error").removeClass("success");
	}, 20);
}

export const updateStatefulFooterElements = Tracker.autorun(function () {
	const allElements = $.merge([], footerElements);
	$.merge(allElements, hiddenFooterElements.selectable);
	$.each(allElements, function (index, item) {
		let state = true;
		if (item.id === "sound") {
			const hashtagDoc = HashtagsCollection.findOne({hashtag: Router.current().params.quizName});
			if (hashtagDoc && hashtagDoc.musicEnabled) {
				$('#sound').removeClass("error").addClass("success");
			} else {
				state = false;
				$('#sound').removeClass("success").addClass("error");
			}
			$('#sound_switch').bootstrapSwitch('state', state, true);
		}

		if (item.id === 'reading-confirmation') {
			$('#reading-confirmation').removeClass("error").addClass("success");
			$('#reading-confirmation_switch').bootstrapSwitch('state', state, true);
			/*
			 Since the functionality is currently not implemented the state is set to enabled!

			 if (HashtagsCollection.findOne({hashtag: Router.current().params.quizName}).readingConfirmationEnabled) {
			 $('#reading-confirmation').removeClass("error").addClass("success");
			 } else {
			 state = false;
			 $('#reading-confirmation').removeClass("success").addClass("error");
			 }
			 $('#reading-confirmation_switch').bootstrapSwitch('state', state, true);
			 */
		}

		if (item.id === "nicknames") {
			if (Session.get("questionGroup").getSelectedNicks().length === 0) {
				$('#nicknames').removeClass("success").parent().find(".footerElemText").find("span").text(TAPi18n.__("view.nickname_categories.free_choice"));
			} else {
				$('#nicknames').addClass("success").parent().find(".footerElemText").find("span").text(TAPi18n.__("region.footer.footer_bar.nicknames"));
			}
		}
	});
});

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
	setTimeout(function () {
		updateStatefulFooterElements.invalidate();
	}, 20);
	return footerElements;
}

export function removeFooterElement(footerElement) {
	let hasFoundItem = false;
	$.each(footerElements, function (index, item) {
		if (item.id === footerElement.id) {
			footerElements.splice(index, 1);
			hasFoundItem = true;
			return false;
		}
	});
	if (hasFoundItem) {
		return;
	}
	$.each(hiddenFooterElements.selectable, function (index, item) {
		if (item.id === footerElement.id) {
			hiddenFooterElements.selectable.splice(index, 1);
			hasFoundItem = true;
			return false;
		}
	});
	if (hasFoundItem) {
		return;
	}
	$.each(hiddenFooterElements.linkable, function (index, item) {
		if (item.id === footerElement.id) {
			hiddenFooterElements.linkable.splice(index, 1);
			return false;
		}
	});
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
	headerLib.calculateTitelHeight();
	return {
		icon: iconSize,
		text: textSize
	};
}

export function calculateFooter() {
	$(window).on("resize", function () {
		if ($(window).height() > 400) {
			generateFooterElements();
			setTimeout(calculateFooterFontSize, 20);
		}
	});
	generateFooterElements();
	setTimeout(calculateFooterFontSize, 20);
}
