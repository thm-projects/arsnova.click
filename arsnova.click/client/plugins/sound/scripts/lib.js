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

export let buzzsound1 = null;
export let lobbySound = null;

export const whistleSound = new buzz.sound('/sounds/whistle.mp3', {
	volume: Session.get("slider2") || 40
});

export function setBuzzsound1(songName) {
	var fileName = "";
	switch (songName) {
		case "Song1":
			fileName = "bensound-thelounge.mp3";
			break;
		case "Song2":
			fileName = "bensound-cute.mp3";
			break;
		case "Song3":
			fileName = "bensound-epic.mp3";
			break;
		default:
			break;
	}

	buzzsound1 = new buzz.sound('/sounds/' + fileName, {
		loop: true
	});
}

export function setLobbySound(songName, autostart = true) {
	var fileName = "";
	Session.set("lobbySoundIsPlaying", false);
	switch (songName) {
		case "LobbySong1":
			fileName = "bensound-clearday.mp3";
			break;
		case "LobbySong2":
			fileName = "bensound-house.mp3";
			break;
		case "LobbySong3":
			fileName = "bensound-jazzyfrenchy.mp3";
			break;
		case "LobbySong4":
			fileName = "bensound-littleidea.mp3";
			break;
		default:
			break;
	}
	lobbySound = new buzz.sound("/sounds/" + fileName, {
		loop: true
	});
	if (autostart) {
		Session.set("lobbySoundIsPlaying", songName);
		lobbySound.play();
	}
}
