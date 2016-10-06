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
import {TAPi18n} from 'meteor/tap:i18n';
import {themes} from './lib.js';

Template.themeSwitcher.events({
	"change #select-theme": function (event) {
		const theme = $(event.currentTarget).find("option:selected").attr("id");
		localStorage.setItem("theme", theme);
		Session.set("theme", theme);

		for (let i = 0; i < themes.length; i++) {
			if (themes[i].id === theme) {
				$('.theme-description').text(TAPi18n.__(themes[i].description));
				i = themes.length;
			}
		}

		const quiz = Session.get("questionGroup");
		if (quiz) {
			quiz.getConfiguration().setTheme(theme);
			Session.set("questionGroup", quiz);
			Meteor.call("SessionConfiguration.setTheme", Session.get("questionGroup").getHashtag(), theme);
		}
	},
	"click #backButton": function () {
		if (Session.get("questionGroup")) {
			Router.go("/" + Session.get("questionGroup").getHashtag() + "/memberlist");
		} else {
			history.back();
		}
	}
});
