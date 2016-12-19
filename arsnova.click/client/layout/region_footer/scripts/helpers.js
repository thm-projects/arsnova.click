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
import {Session} from 'meteor/session';
import {Router} from 'meteor/iron:router';
import {TAPi18n} from 'meteor/tap:i18n';
import * as footerElements from "./lib.js";

Template.footer.helpers({
	footerElements: function () {
		return Session.get("footerElements");
	}
});

Template.hiddenFooterElement.helpers({
	isStatefulElement: function (item) {
		return !!item.selectable;
	},
	isEnabled: function (item) {
		if (!Session.get("questionGroup")) {
			return;
		}
		const configDoc = Session.get("questionGroup").getConfiguration();
		switch (item.id) {
			case "sound":
				return !!(configDoc && configDoc.getMusicSettings().isEnabled());
			case "reading-confirmation":
				if (configDoc && configDoc.getReadingConfirmationEnabled()) {
					Meteor.defer(function () {
						$('#reading-confirmation').find(".footerElemIcon").find(".glyphicon").removeClass("glyphicon-eye-open").addClass("glyphicon-eye-close");
					});
					return false;
				} else {
					Meteor.defer(function () {
						$('#reading-confirmation').find(".footerElemIcon").find(".glyphicon").removeClass("glyphicon-eye-close").addClass("glyphicon-eye-open");
					});
					return true;
				}
				break;
			case "nicknames":
				if (configDoc.getNickSettings().getSelectedValues().length === 0) {
					$('#nicknames').find(".footerElemText").text(TAPi18n.__("view.nickname_categories.free_choice"));
					return false;
				} else {
					$('#nicknames').find(".footerElemText").text(TAPi18n.__("region.footer.footer_bar.nicknames"));
					return true;
				}
		}
	}
});

Template.showMore.helpers({
	footerElements: function () {
		footerElements.footerTracker.depend();
		Meteor.defer(function () {
			footerElements.updateStatefulFooterElements();
			footerElements.calculateFooterFontSize();
		});
		return $.parseJSON(sessionStorage.getItem("footerElementsBackup"));
	}
});

Template.contactHeaderBar.helpers({
	isCurrentRoute: function (route) {
		return Router.current().url.indexOf(route) > -1;
	},
	isXsDevice: function () {
		return $(document).width() <= 768;
	}
});
