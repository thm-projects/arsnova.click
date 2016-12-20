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

export let lobbySound = null;
export let countdownRunningSound = null;
export let countdownEndSound = null;

export function setLobbySound(songName, autostart = true) {
	let fileName = "";
	switch (songName) {
		case "Song0":
			fileName = "bensound-clearday.mp3";
			break;
		case "Song1":
			fileName = "bensound-house.mp3";
			break;
		case "Song2":
			fileName = "bensound-jazzyfrenchy.mp3";
			break;
		case "Song3":
			fileName = "bensound-littleidea.mp3";
			break;
		default:
			break;
	}

	if (lobbySound) {
		lobbySound.stop();
		Session.set("lobbySoundIsPlaying", false);
	}

	lobbySound = new buzz.sound("/sounds/" + fileName, {
		loop: true,
		preload: true,
		volume: lobbySound ? lobbySound.getVolume() : 80
	});
	lobbySound.bind("ended", function () {
		$('#playStopLobbyMusic').bootstrapToggle("on");
	});

	if (autostart) {
		lobbySound.play();
		Session.set("lobbySoundIsPlaying", true);
	}
}

export function setCountdownRunningSound(songName, autostart = true) {
	let fileName = "";
	switch (songName) {
		case "Song0":
			fileName = "bensound-thelounge.mp3";
			break;
		case "Song1":
			fileName = "bensound-cute.mp3";
			break;
		case "Song2":
			fileName = "bensound-epic.mp3";
			break;
		default:
			break;
	}

	if (countdownRunningSound) {
		countdownRunningSound.stop();
		Session.set("countdownRunningSoundIsPlaying", false);
	}

	countdownRunningSound = new buzz.sound('/sounds/' + fileName, {
		loop: true,
		preload: true,
		volume: countdownRunningSound ? countdownRunningSound.getVolume() : 80
	});
	countdownRunningSound.bind("ended", function () {
		$('#playStopCountdownRunningSound').bootstrapToggle("on");
	});

	if (autostart) {
		countdownRunningSound.play();
		Session.set("countdownRunningSoundIsPlaying", true);
	}
}

export function setCountdownEndSound(songName) {
	let fileName = "";
	switch (songName) {
		case "Song0":
			fileName = "whistle.mp3";
			break;
		case "Song1":
			fileName = "chinese_gong.mp3";
			break;
		default:
			break;
	}

	if (countdownEndSound) {
		countdownEndSound.stop();
	}

	countdownEndSound = new buzz.sound("/sounds/" + fileName, {
		loop: false,
		preload: true,
		volume: countdownEndSound ? countdownEndSound.getVolume() : 80
	});
	countdownEndSound.bind("ended", function () {
		$('#playStopCountdownEndSound').bootstrapToggle("on");
	});
}
