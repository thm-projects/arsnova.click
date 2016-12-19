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
import * as footerElements from "./lib.js";

Template.hiddenFooterElement.onRendered(function () {
	Meteor.defer(function () {
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	});
});

Template.showMore.onRendered(function () {
	if (footerElements.getCurrentFooterElements().length === 0 || localStorage.getItem("lastPage") === ":quizName.showMore") {
		const restoredFooters = JSON.parse(sessionStorage.getItem("footerElementsBackup"));
		if (restoredFooters && restoredFooters.length > 0) {
			restoredFooters.forEach(function (item) {
				footerElements.addFooterElement(footerElements.getFooterElementById(item.id));
			});
		}
	}
	footerElements.removeFooterElement(footerElements.footerElemShowMore);
	footerElements.removeFooterElement(footerElements.footerElemHome);
	sessionStorage.setItem("footerElementsBackup", JSON.stringify(footerElements.getCurrentFooterElements()));
	footerElements.removeFooterElements();
	footerElements.footerTracker.changed();
});

Template.contactHeaderBar.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	footerElements.addFooterElement(footerElements.footerElemTranslation);
	footerElements.addFooterElement(footerElements.footerElemTheme);
	if (navigator.userAgent.match(/iPad/i) == null) {
		footerElements.addFooterElement(footerElements.footerElemFullscreen);
	}
	footerElements.addFooterElement(footerElements.footerElemHashtagManagement);
	headerLib.calculateHeaderSize();
});

Template.about.onRendered(function () {
	Meteor.defer(function () {
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	});
});

Template.agb.onRendered(function () {
	Meteor.defer(function () {
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	});
});

Template.dataprivacy.onRendered(function () {
	Meteor.defer(function () {
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	});
});

Template.imprint.onRendered(function () {
	Meteor.defer(function () {
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	});
});
