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
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import  * as localData from '/lib/local_storage.js';
import {Splashscreen, ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as hashtagLib from '/client/layout/view_hashtag_management/scripts/lib.js';
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {startConnectionIndication, getRTT, forceFeedback} from '/client/layout/global/scripts/lib.js';
import {checkIfThemeExist} from "/shared/themes.js";

Template.home.onRendered(function () {
	if (localData.getAllHashtags().length > 0) {
		hashtagLib.setHashtagSplashscreen(new Splashscreen({
			autostart: true,
			templateName: "showHashtagsSplashscreen",
			closeOnButton: ".splashscreen-container-close"
		}));
	}
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

	if ($(window).width() >= 992 && localData.getAllHashtags().length === 0) {
		$('#hashtag-input-field').focus();
	}
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemAbout);
	footerElements.addFooterElement(footerElements.footerElemTranslation);
	footerElements.addFooterElement(footerElements.footerElemTheme);
	if (navigator.userAgent.match(/iPad/i) == null) {
		footerElements.addFooterElement(footerElements.footerElemFullscreen);
	}
	if (localData.getAllHashtags().length > 0) {
		footerElements.addFooterElement(footerElements.footerElemHashtagManagement);
	} else {
		footerElements.addFooterElement(footerElements.footerElemImport);
	}
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
});

Template.layout.onRendered(function () {
	startConnectionIndication();
	getRTT();
	$("body").on("click", "button", forceFeedback);

	this.autorun(function () {
		if (Session.get("overrideTheme")) {
			return;
		}
		if (!Session.get("theme") || (Session.get("currentTheme") && Session.get("theme") === Session.get("currentTheme"))) {
			const configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
			if (!localStorage.getItem("theme")) {
				localStorage.setItem("theme", Meteor.settings.public.defaultTheme);
			}
			if (configDoc) {
				if (!checkIfThemeExist(configDoc.theme)) {
					configDoc.theme = Meteor.settings.public.defaultTheme;
				}
				Session.set("theme", configDoc.theme);
			} else {
				if (!checkIfThemeExist(localStorage.getItem("theme"))) {
					localStorage.setItem("theme", Meteor.settings.public.defaultTheme);
				}
				Session.set("theme", localStorage.getItem("theme"));
			}
		}
		$("body").removeClass().addClass(Session.get("theme"));
	}.bind(this));
});
