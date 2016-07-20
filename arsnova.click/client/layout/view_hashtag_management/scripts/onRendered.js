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
import {calculateHeaderSize} from '/client/layout/region_header/lib.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";

Template.hashtagView.onRendered(function () {
	try {
		if (!localStorage.getItem("localStorageAvailable")) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: "plugins.splashscreen.error.error_messages.private_browsing"
			});
			return;
		}
	} catch (err) {
		new ErrorSplashscreen({
			autostart: true,
			errorMessage: "plugins.splashscreen.error.error_messages.private_browsing"
		});
		return;
	}

	if ($(window).width() >= 992) {
		$('#hashtag-input-field').focus();
	}
});

Template.hashtagManagement.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	if (navigator.userAgent.match(/iPad/i) == null) {
		footerElements.addFooterElement(footerElements.footerElemImport);
	}
	footerElements.addFooterElement(footerElements.footerElemAbout);
	footerElements.addFooterElement(footerElements.footerElemTranslation);
	footerElements.addFooterElement(footerElements.footerElemTheme);
	if (navigator.userAgent.match(/iPad/i) == null) {
		footerElements.addFooterElement(footerElements.footerElemFullscreen);
	}
	footerElements.calculateFooter();

	calculateHeaderSize();
	$(window).resize(calculateHeaderSize);

	$('.js-export').tooltip();
	$('.js-delete').tooltip();
	$('.js-reactivate-hashtag').tooltip();
	$('.startQuiz').tooltip();

	$('.hashtagManagementRow').each(function (i, element) {
		var hashtag = element.id;
		var exportData = localData.exportFromLocalStorage(hashtag);
		if (exportData) {
			var exportDataJson = "text/json;charset=utf-8," + encodeURIComponent(exportData);
			var a = document.createElement('a');
			var time = new Date();
			var timeString = time.getDate() + "_" + (time.getMonth() + 1) + "_" + time.getFullYear();
			a.href = 'data:' + exportDataJson;
			a.download = hashtag + "-" + timeString + ".json";
			a.innerHTML = '<span class="glyphicon glyphicon-export glyph-left alignGlyphicon button-foreground-color" aria-hidden="true"></span>';
			$(element).find('.js-export').append(a);
		}
		const session = localData.reenterSession(hashtag);
		if (!session.isValid()) {
			$(element).find(".startQuiz").attr("disabled", "disabled");
		}
	});
});
