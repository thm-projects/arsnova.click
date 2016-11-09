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
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as lib from './lib.js';
import * as localData from '/lib/local_storage.js';

Template.soundConfig.events({
	"change #soundSelect": function (event) {
		var configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
		configDoc.music.title = $(event.target).val();
		if (Session.get("soundIsPlaying")) {
			lib.buzzsound1.stop();
			lib.setBuzzsound1($(event.target).val());
			lib.buzzsound1.play();
		} else {
			lib.setBuzzsound1($(event.target).val());
		}
		Meteor.call('SessionConfiguration.setMusic', configDoc);
		const questionItem = Session.get("questionGroup");
		questionItem.getConfiguration().getMusicSettings().setTitle($(event.target).val());
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	},
	"change #lobbySoundSelect": function (event) {
		if (Session.get("lobbySoundIsPlaying")) {
			lib.lobbySound.stop();
			lib.setLobbySound($(event.target).val());
		} else {
			lib.setLobbySound($(event.target).val());
		}
	},
	"click #js-btn-playStopMusic": function () {
		if (Session.get("soundIsPlaying")) {
			lib.buzzsound1.stop();
			Session.set("soundIsPlaying", false);
			$('#js-btn-playStopMusic').toggleClass("down").removeClass("button-warning").addClass("button-success");
		} else {
			lib.buzzsound1.play();
			Session.set("soundIsPlaying", true);
			$('#js-btn-playStopMusic').toggleClass("down").removeClass("button-success").addClass("button-warning");
		}
	},
	"click #playStopLobbyMusic": function () {
		if (Session.get("lobbySoundIsPlaying")) {
			lib.lobbySound.stop();
			Session.set("lobbySoundIsPlaying", false);
			$('#playStopLobbyMusic').toggleClass("down").removeClass("button-warning").addClass("button-success");
		} else {
			lib.lobbySound.play();
			Session.set("lobbySoundIsPlaying", true);
			$('#playStopLobbyMusic').toggleClass("down").removeClass("button-success").addClass("button-warning");
		}
	},
	"click #js-btn-hideSoundModal": function () {
		lib.buzzsound1.stop();
		Session.set("soundIsPlaying", false);
	},
	"click #isSoundOnButton": function () {
		var configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
		var btn = $('#isSoundOnButton');
		btn.toggleClass("down");
		if (btn.hasClass("down")) {
			configDoc.music.isEnabled = true;
			btn.html(TAPi18n.__("plugins.sound.active"));
		} else {
			configDoc.music.isEnabled = false;
			btn.html(TAPi18n.__("plugins.sound.inactive"));
		}
		Meteor.call('SessionConfiguration.setMusic', configDoc);
		const questionItem = Session.get("questionGroup");
		questionItem.getConfiguration().getMusicSettings().setEnabled(configDoc.music.isEnabled);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(Session.get("questionGroup"));
	}
});
