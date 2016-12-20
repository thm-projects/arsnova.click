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
import {MusicSessionConfiguration} from "/lib/session_configuration/session_config_music.js";
import {randomIntFromInterval} from '/client/layout/view_live_results/scripts/lib.js';
import * as localData from '/lib/local_storage.js';
import * as lib from './lib.js';

Template.soundConfig.onRendered(function () {
	const configDoc = SessionConfigurationCollection.findOne({hashtag: Router.current().params.quizName});
	let title;

	title = configDoc.music.lobbyTitle;
	$('#lobbySoundSelect').val(title);
	if (lib.lobbySound === null) {
		if (title === "Random") {
			title = MusicSessionConfiguration.getAvailableMusic().lobbyMusic[randomIntFromInterval(0, MusicSessionConfiguration.getAvailableMusic().lobbyMusic.length - 1)];
		}
		lib.setLobbySound(title, false);
		lib.lobbySound.setVolume(configDoc.music.lobbyVolume);
	}

	title = configDoc.music.countdownRunningTitle;
	$('#countdownRunningSelect').val(title);
	if (lib.countdownRunningSound === null) {
		if (title === "Random") {
			title = MusicSessionConfiguration.getAvailableMusic().countdownRunning[randomIntFromInterval(0, MusicSessionConfiguration.getAvailableMusic().countdownRunning.length - 1)];
		}
		lib.setCountdownRunningSound(title, false);
		lib.countdownRunningSound.setVolume(configDoc.music.countdownRunningVolume);
	}

	title = configDoc.music.countdownEndTitle;
	$('#countdownEndSelect').val(title);
	if (lib.countdownEndSound === null) {
		if (title === "Random") {
			title = MusicSessionConfiguration.getAvailableMusic().countdownEnd[randomIntFromInterval(0, MusicSessionConfiguration.getAvailableMusic().countdownEnd.length - 1)];
		}
		lib.setCountdownEndSound(title);
		lib.countdownEndSound.setVolume(configDoc.music.countdownEndVolume);
	}

	noUiSlider.create(document.getElementById("slider-lobby-music"), {
		start: configDoc.music.lobbyVolume,
		animate: false,
		range: {
			'min': 0,
			'max': 100
		}
	}).on('slide', function (val) {
		const musicVolume = Math.round(val);
		const currentConfig = Session.get("musicSlider");
		currentConfig.lobbyMusic = musicVolume;
		Session.set('musicSlider', currentConfig);
		lib.lobbySound.setVolume(musicVolume);
		const questionGroup = Session.get("questionGroup");
		questionGroup.getConfiguration().getMusicSettings().setLobbyVolume(musicVolume);
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(questionGroup);
	});
	noUiSlider.create(document.getElementById("slider-countdown-running"), {
		start: configDoc.music.countdownRunningVolume,
		animate: false,
		range: {
			'min': 0,
			'max': 100
		}
	}).on('slide', function (val) {
		const musicVolume = Math.round(val);
		const currentConfig = Session.get("musicSlider");
		currentConfig.countdownRunning = musicVolume;
		Session.set('musicSlider', currentConfig);
		lib.countdownRunningSound.setVolume(musicVolume);
		const questionGroup = Session.get("questionGroup");
		questionGroup.getConfiguration().getMusicSettings().setCountdownRunningVolume(musicVolume);
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(questionGroup);
	});
	noUiSlider.create(document.getElementById("slider-countdown-end"), {
		start: configDoc.music.countdownEndVolume,
		animate: false,
		range: {
			'min': 0,
			'max': 100
		}
	}).on('slide', function (val) {
		const musicVolume = Math.round(val);
		const currentConfig = Session.get("musicSlider");
		currentConfig.countdownEnd = musicVolume;
		Session.set('musicSlider', currentConfig);
		lib.countdownEndSound.setVolume(musicVolume);
		const questionGroup = Session.get("questionGroup");
		questionGroup.getConfiguration().getMusicSettings().setCountdownEndVolume(musicVolume);
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(questionGroup);
	});
	noUiSlider.create(document.getElementById("slider-global-volume"), {
		start: configDoc.music.isUsingGlobalVolume ? configDoc.music.lobbyVolume : 80,
		animate: false,
		range: {
			'min': 0,
			'max': 100
		}
	}).on('slide', function (val) {
		const musicVolume = Math.round(val);
		const currentConfig = Session.get("musicSlider");
		const questionGroup = Session.get("questionGroup");

		currentConfig.global = musicVolume;
		currentConfig.lobbyMusic = musicVolume;
		currentConfig.countdownRunning = musicVolume;
		currentConfig.countdownEnd = musicVolume;
		Session.set('musicSlider', currentConfig);

		lib.lobbySound.setVolume(musicVolume);
		lib.countdownRunningSound.setVolume(musicVolume);
		lib.countdownEndSound.setVolume(musicVolume);

		document.getElementById("slider-lobby-music").noUiSlider.set(musicVolume);
		document.getElementById("slider-countdown-running").noUiSlider.set(musicVolume);
		document.getElementById("slider-countdown-end").noUiSlider.set(musicVolume);

		questionGroup.getConfiguration().getMusicSettings().setGlobalVolume(musicVolume);
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(questionGroup);
	});
	if (configDoc.music.isUsingGlobalVolume) {
		document.getElementById("slider-lobby-music").setAttribute('disabled', true);
		document.getElementById("slider-countdown-running").setAttribute('disabled', true);
		document.getElementById("slider-countdown-end").setAttribute('disabled', true);
	} else {
		document.getElementById("slider-global-volume").setAttribute('disabled', true);
	}
	$('#activateDeactivateGlobalVolume').prop("checked", configDoc.music.isUsingGlobalVolume);
	$('#activateDeactivateLobbyMusic').prop("checked", configDoc.music.lobbyEnabled);
	$('#activateDeactivateCountdownRunningSound').prop("checked", configDoc.music.countdownRunningEnabled);
	$('#activateDeactivateCountdownEndSound').prop("checked", configDoc.music.countdownEndEnabled);
	$('#playStopLobbyMusic').prop("checked", !Session.get("lobbySoundIsPlaying"));
	$('#playStopCountdownRunningSound').prop("checked", true);
	$('#playStopCountdownEndSound').prop("checked", true);
	$('input[name=switch]').bootstrapToggle();
});
