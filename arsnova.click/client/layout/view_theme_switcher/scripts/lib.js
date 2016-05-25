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
import {TAPi18n} from 'meteor/tap:i18n';

export const themes = [
	{
		name: TAPi18n.__("view.theme_switcher.themes.default.name"),
		description: TAPi18n.__("view.theme_switcher.themes.default.description"),
		id: "theme-default",
		selected: Session.get("questionGroup") && Session.get("questionGroup").getTheme() === "theme-default" ? 'selected' : ""
	},
	{
		name: TAPi18n.__("view.theme_switcher.themes.dark.name"),
		description: TAPi18n.__("view.theme_switcher.themes.dark.description"),
		id: "theme-dark",
		selected: Session.get("questionGroup") && Session.get("questionGroup").getTheme() === "theme-dark" ? 'selected' : ""
	},
	{
		name: TAPi18n.__("view.theme_switcher.themes.thm.name"),
		description: TAPi18n.__("view.theme_switcher.themes.thm.description"),
		id: "theme-thm",
		selected: Session.get("questionGroup") && Session.get("questionGroup").getTheme() === "theme-thm" ? 'selected' : ""
	},
	{
		name: TAPi18n.__("view.theme_switcher.themes.elegant.name"),
		description: TAPi18n.__("view.theme_switcher.themes.elegant.description"),
		id: "theme-elegant",
		selected: Session.get("questionGroup") && Session.get("questionGroup").getTheme() === "theme-elegant" ? 'selected' : ""
	},
	{
		name: TAPi18n.__("view.theme_switcher.themes.arsnova.name"),
		description: TAPi18n.__("view.theme_switcher.themes.arsnova.description"),
		id: "theme-arsnova",
		selected: Session.get("questionGroup") && Session.get("questionGroup").getTheme() === "theme-arsnova" ? 'selected' : ""
	}
];
