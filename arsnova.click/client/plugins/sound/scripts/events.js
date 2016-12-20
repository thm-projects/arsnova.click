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
import {randomIntFromInterval} from '/client/layout/view_live_results/scripts/lib.js';
import * as localData from '/lib/local_storage.js';
import * as lib from './lib.js';

Template.soundConfig.events({
	"change #activateDeactivateGlobalVolume": function (event) {
		const questionGroup = Session.get("questionGroup");
		const currentConfig = Session.get("musicSlider");

		if ($(event.target).prop("checked")) {
			const musicVolume = Math.round(document.getElementById('slider-global-volume').noUiSlider.get());

			currentConfig.global = musicVolume;
			currentConfig.lobbyMusic = musicVolume;
			currentConfig.countdownRunning = musicVolume;
			currentConfig.countdownEnd = musicVolume;

			lib.lobbySound.setVolume(musicVolume);
			lib.countdownRunningSound.setVolume(musicVolume);
			lib.countdownEndSound.setVolume(musicVolume);

			questionGroup.getConfiguration().getMusicSettings().setIsUsingGlobalVolume(true);
			questionGroup.getConfiguration().getMusicSettings().setGlobalVolume(musicVolume);

			document.getElementById("slider-global-volume").removeAttribute('disabled');

			document.getElementById("slider-lobby-music").setAttribute('disabled', true);
			document.getElementById("slider-lobby-music").noUiSlider.set(musicVolume);
			document.getElementById("slider-countdown-running").setAttribute('disabled', true);
			document.getElementById("slider-countdown-running").noUiSlider.set(musicVolume);
			document.getElementById("slider-countdown-end").setAttribute('disabled', true);
			document.getElementById("slider-countdown-end").noUiSlider.set(musicVolume);
		} else {
			currentConfig.global = 80;

			questionGroup.getConfiguration().getMusicSettings().setIsUsingGlobalVolume(false);

			document.getElementById("slider-global-volume").setAttribute('disabled', true);
			document.getElementById("slider-global-volume").noUiSlider.set(80);

			document.getElementById("slider-lobby-music").removeAttribute('disabled');
			document.getElementById("slider-countdown-running").removeAttribute('disabled');
			document.getElementById("slider-countdown-end").removeAttribute('disabled');
		}

		Session.set('musicSlider', currentConfig);
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(questionGroup);
		Meteor.call('SessionConfiguration.setMusic', questionGroup.getConfiguration());
	},
	"change #lobbySoundSelect": function (event) {
		let songTitle = $(event.target).val();
		if (songTitle === "Random") {
			songTitle = "Song" + randomIntFromInterval(0, $(event.target).find("option").length - 2);
		}

		lib.setLobbySound(songTitle, Session.get("lobbySoundIsPlaying"));
		$('#playStopLobbyMusic').bootstrapToggle("on");

		const questionItem = Session.get("questionGroup");
		questionItem.getConfiguration().getMusicSettings().setLobbyTitle(songTitle);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(questionItem);
		Meteor.call('SessionConfiguration.setMusic', questionItem.getConfiguration());
	},
	"change #playStopLobbyMusic": function (event) {
		if ($(event.target).prop("checked")) {
			lib.lobbySound.stop();
			Session.set("lobbySoundIsPlaying", false);
		} else {
			let songTitle = $('#lobbySoundSelect').val();
			if (songTitle === "Random") {
				songTitle = "Song" + randomIntFromInterval(0, $('#lobbySoundSelect').find("option").length - 2);
				lib.setLobbySound(songTitle);
			}
			lib.lobbySound.play();
			Session.set("lobbySoundIsPlaying", true);
		}
	},
	"change #activateDeactivateLobbyMusic": function (event) {
		const questionItem = Session.get("questionGroup");
		questionItem.getConfiguration().getMusicSettings().setLobbyEnabled($(event.target).prop("checked"));
		Session.set("questionGroup", questionItem);
		localData.addHashtag(questionItem);
		Meteor.call('SessionConfiguration.setMusic', questionItem.getConfiguration());
	},
	"change #countdownRunningSelect": function (event) {
		let songTitle = $(event.target).val();
		if (songTitle === "Random") {
			songTitle = "Song" + randomIntFromInterval(0, $(event.target).find("option").length - 2);
		}

		lib.setCountdownRunningSound(songTitle, Session.get("countdownRunningSoundIsPlaying"));
		$('#playStopCountdownRunningSound').bootstrapToggle("on");

		const questionItem = Session.get("questionGroup");
		questionItem.getConfiguration().getMusicSettings().setCountdownRunningTitle(songTitle);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(questionItem);
		Meteor.call('SessionConfiguration.setMusic', questionItem.getConfiguration());
	},
	"change #playStopCountdownRunningSound": function (event) {
		if ($(event.target).prop("checked")) {
			lib.countdownRunningSound.stop();
			Session.set("countdownRunningSoundIsPlaying", false);
		} else {
			let songTitle = $('#countdownRunningSelect').val();
			if (songTitle === "Random") {
				songTitle = "Song" + randomIntFromInterval(0, $('#countdownRunningSelect').find("option").length - 2);
				lib.setCountdownRunningSound(songTitle);
			}
			lib.countdownRunningSound.play();
			Session.set("countdownRunningSoundIsPlaying", true);
		}
	},
	"change #activateDeactivateCountdownRunningSound": function (event) {
		const questionItem = Session.get("questionGroup");
		questionItem.getConfiguration().getMusicSettings().setCountdownRunningEnabled($(event.target).prop("checked"));
		Session.set("questionGroup", questionItem);
		localData.addHashtag(questionItem);
		Meteor.call('SessionConfiguration.setMusic', questionItem.getConfiguration());
	},
	"change #countdownEndSelect": function (event) {
		let songTitle = $(event.target).val();
		if (songTitle === "Random") {
			songTitle = "Song" + randomIntFromInterval(0, $(event.target).find("option").length - 2);
		}

		lib.setCountdownEndSound(songTitle);
		$('#playStopCountdownEndSound').bootstrapToggle("on");

		const questionItem = Session.get("questionGroup");
		questionItem.getConfiguration().getMusicSettings().setCountdownEndTitle(songTitle);
		Session.set("questionGroup", questionItem);
		localData.addHashtag(questionItem);
		Meteor.call('SessionConfiguration.setMusic', questionItem.getConfiguration());
	},
	"change #playStopCountdownEndSound": function (event) {
		if ($(event.target).prop("checked")) {
			lib.countdownEndSound.stop();
			Session.set("countdownEndSoundIsPlaying", false);
		} else {
			let songTitle = $('#countdownEndSelect').val();
			if (songTitle === "Random") {
				songTitle = "Song" + randomIntFromInterval(0, $('#countdownEndSelect').find("option").length - 2);
				lib.setCountdownEndSound(songTitle);
			}
			lib.countdownEndSound.play();
			Session.set("countdownEndSoundIsPlaying", true);
		}
	},
	"change #activateDeactivateCountdownEndSound": function (event) {
		const questionItem = Session.get("questionGroup");
		questionItem.getConfiguration().getMusicSettings().setCountdownEndEnabled($(event.target).prop("checked"));
		Session.set("questionGroup", questionItem);
		localData.addHashtag(questionItem);
		Meteor.call('SessionConfiguration.setMusic', questionItem.getConfiguration());
	}
});
