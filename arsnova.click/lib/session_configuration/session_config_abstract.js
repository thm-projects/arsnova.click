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
import {MusicSessionConfiguration} from './session_config_music.js';
import {NickSessionConfiguration} from './session_config_nicks.js';

const hashtag = Symbol("hashtag");
const music = Symbol("music");
const nicks = Symbol("nicks");
const theme = Symbol("theme");
const readingConfirmationEnabled = Symbol("readingConfirmationEnabled");
const showResponseProgress = Symbol("showResponseProgress");
const confidenceSliderEnabled = Symbol("confidenceSliderEnabled");

export class AbstractSessionConfiguration {
	constructor (options) {
		if (this.constructor === AbstractSessionConfiguration) {
			throw new TypeError("Cannot construct Abstract instances directly");
		}
		if (typeof options.hashtag === "undefined") {
			throw new Error("Invalid argument list for SessionConfiguration instantiation");
		}
		if (options.music instanceof Object) {
			if (!(options.music instanceof MusicSessionConfiguration)) {
				options.music = new MusicSessionConfiguration(options);
			}
		} else {
			options.music = {};
			options.music = new MusicSessionConfiguration(options);
		}
		if (options.nicks instanceof Object) {
			if (!(options.nicks instanceof NickSessionConfiguration)) {
				options.nicks = new NickSessionConfiguration(options);
			}
		} else {
			options.nicks = {};
			options.nicks = new NickSessionConfiguration(options);
		}
		this[hashtag] = options.hashtag;
		this[music] = options.music;
		this[nicks] = options.nicks;
		this[theme] = options.theme || Meteor.settings.public.default.theme;
		this[readingConfirmationEnabled] = typeof options.readingConfirmationEnabled === "undefined" ? Meteor.settings.public.default.sessionConfiguration.readingConfirmationEnabled : options.readingConfirmationEnabled;
		this[showResponseProgress] = typeof options.showResponseProgress === "undefined" ? Meteor.settings.public.default.sessionConfiguration.showResponseProgress : options.showResponseProgress === true;
		this[confidenceSliderEnabled] = typeof options.confidenceSliderEnabled === "undefined" ? Meteor.settings.public.default.sessionConfiguration.confidenceSliderEnabled : options.confidenceSliderEnabled === true;
	}

	serialize () {
		return {
			hashtag: this.getHashtag(),
			music: this.getMusicSettings().serialize(),
			nicks: this.getNickSettings().serialize(),
			theme: this.getTheme(),
			readingConfirmationEnabled: this.getReadingConfirmationEnabled(),
			showResponseProgress: this.getShowResponseProgress(),
			confidenceSliderEnabled: this.getConfidenceSliderEnabled()
		};
	}

	equals (value) {
		return this.getHashtag() === value.getHashtag() &&
				this.getMusicSettings().equals(value.getMusicSettings()) &&
				this.getNickSettings().equals(value.getNickSettings()) &&
				this.getTheme() === value.getTheme() &&
				this.getReadingConfirmationEnabled() === value.getReadingConfirmationEnabled() &&
				this.getShowResponseProgress() === value.getShowResponseProgress() &&
				this.getConfidenceSliderEnabled() === value.getConfidenceSliderEnabled();
	}

	/**
	 * Part of EJSON interface
	 * @see AbstractSessionConfiguration.serialize()
	 * @see http://docs.meteor.com/api/ejson.html#EJSON-CustomType-toJSONValue
	 * @returns Object
	 */
	toJSONValue () {
		return this.serialize();
	}

	getHashtag () {
		return this[hashtag];
	}

	setHashtag (value) {
		this[hashtag] = value;
		this.getMusicSettings().setHashtag(value);
		this.getNickSettings().setHashtag(value);
	}

	getTheme () {
		return this[theme];
	}

	setTheme (value) {
		this[theme] = value;
	}

	getMusicSettings () {
		return this[music];
	}

	setMusicSettings (value) {
		if (value instanceof Object && !(value instanceof MusicSessionConfiguration)) {
			value = new MusicSessionConfiguration(value);
		}
		this[music] = value;
	}

	getNickSettings () {
		return this[nicks];
	}

	setNickSettings (value) {
		if (value instanceof Object && !(value instanceof NickSessionConfiguration)) {
			value = new NickSessionConfiguration(value);
		}
		this[nicks] = value;
	}

	getReadingConfirmationEnabled () {
		return this[readingConfirmationEnabled];
	}

	setReadingConfirmationEnabled (value) {
		if (typeof value !== "boolean") {
			throw new Error("Invalid argument for AbstractSessionConfiguration.setReadingConfirmationEnabled");
		}
		this[readingConfirmationEnabled] = value;
	}

	getShowResponseProgress () {
		return this[showResponseProgress];
	}

	setShowResponseProgress (value) {
		if (typeof value !== "boolean") {
			throw new Error("Invalid argument for AbstractSessionConfiguration.setShowResponseProgress");
		}
		this[showResponseProgress] = value;
	}

	getConfidenceSliderEnabled () {
		return this[confidenceSliderEnabled];
	}

	setConfidenceSliderEnabled (value) {
		if (typeof value !== "boolean") {
			throw new Error("Invalid argument for AbstractSessionConfiguration.setConfidenceSliderEnabled");
		}
		this[confidenceSliderEnabled] = value;
	}
}
