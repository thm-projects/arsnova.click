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
import {themes} from './lib.js';

Template.themeSwitcher.helpers({
	themes: function () {
		return themes;
	},
	isThemeSelected: function (themeName) {
		return localStorage.getItem("theme") === themeName ? "selected" : "";
	},
	themeName: function () {
		var currentTheme = localStorage.getItem("theme");
		var currentThemeName = "";
		Array.prototype.forEach.call(themes, function (theme, i) {
			if (theme.id === currentTheme) {
				currentThemeName = theme.name;
			}
		});
		return TAPi18n.__(currentThemeName);
	},
	isBeamerFriendly: function (themeName) {
		if (themeName === "theme-dark" ||
			themeName === "theme-blackbeauty" ||
			themeName === "theme-arsnova" ||
			themeName === "theme-thm" ||
			themeName === "theme-default") {
			return true;
		} else {
			return false;
		}
	}
});
