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
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import {noUiSlider} from 'meteor/arsnova.click:nouislider';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import {buzzsound1, setBuzzsound1, lobbySound, setLobbySound} from './lib.js';
import {TAPi18n} from 'meteor/tap:i18n';

Template.soundConfig.onRendered(function () {
	var configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
	Session.set("slider2", configDoc.music.volume);

	if (buzzsound1 == null) {
		setBuzzsound1(configDoc.music.title);
	}

	if (lobbySound != null) {
		lobbySound.stop();
		Session.set("lobbySoundIsPlaying", false);
	}

	var lobbyTitle = configDoc.music.lobbyTitle;
	$('#lobbySoundSelect').val(lobbyTitle);
	if (lobbyTitle === "LobbyRandom") {
		lobbyTitle = "LobbySong" + (Math.floor(Math.random() * 4) + 1);
	}

	setLobbySound(lobbyTitle, false);

	let currentPath = Router.current().route.getName().replace(/(:quizName.)*(.:id)*/g, "");

	if (currentPath === "memberlist" && configDoc.music.isLobbyEnabled) {
		lobbySound.play();
		Session.set("lobbySoundIsPlaying", true);
	}

	var votingTitle = configDoc.music.title;
	if (votingTitle === "Random") {
		votingTitle = "Song" + (Math.floor(Math.random() * 3) + 1);
	}
	setBuzzsound1(votingTitle);


	$('#soundSelect').val(votingTitle);

	if (configDoc.music.isEnabled) {
		$('#isSoundOnButton').toggleClass("down").html(TAPi18n.__("plugins.sound.active"));
	}

	var sliderObject = noUiSlider.create(document.getElementById("slider2"), {
		start: configDoc.music.volume,
		range: {
			'min': 0,
			'max': 100
		}
	});

	sliderObject.on('slide', function (val) {
		var musicVolume = Math.round(val);
		Session.set('slider2', musicVolume);
		buzzsound1.setVolume(musicVolume);
		lobbySound.setVolume(musicVolume);
	});
});
