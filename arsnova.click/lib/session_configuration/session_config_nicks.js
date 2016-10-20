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

const hashtag = Symbol("hashtag");
const selectedValues = Symbol("selectedValues");
const blockIllegal = Symbol("blockIllegal");
const restrictToCASLogin = Symbol("restrictToCASLogin");

export class NickSessionConfiguration {
	constructor (options = {}) {
		this[hashtag] = options.hashtag;
		this[selectedValues] = options.nicks.selectedValues || [];
		this[blockIllegal] = typeof options.nicks.blockIllegal === "undefined" ? true : options.nicks.blockIllegal;
		this[restrictToCASLogin] = options.nicks.restrictToCASLogin || false;
	}

	serialize () {
		return {
			hashtag: this.getHashtag(),
			selectedValues: this.getSelectedValues(),
			blockIllegal: this.getBlockIllegal(),
			restrictToCASLogin: this.getRestrictToCASLogin()
		};
	}

	equals (value) {
		return this.getSelectedValues() === value.getSelectedValues() &&
			this.getBlockIllegal() === value.getBlockIllegal() &&
			this.getRestrictToCASLogin() === value.getRestrictToCASLogin();
	}

	getHashtag () {
		return this[hashtag];
	}

	setHashtag (value) {
		this[hashtag] = value;
	}

	getSelectedValues () {
		return this[selectedValues];
	}

	setSelectedValues (newSelectedNicks) {
		if (!(newSelectedNicks instanceof Array) || newSelectedNicks.length === 0) {
			throw new Error("Invalid argument list for NickSessionConfiguration.setSelectedValues");
		}
		this[selectedValues] = newSelectedNicks;
	}

	addSelectedNick (newSelectedNick) {
		if (typeof newSelectedNick !== "string") {
			throw new Error("Invalid argument list for NickSessionConfiguration.addSelectedNick");
		}
		if (this.getSelectedValues().indexOf(newSelectedNick) !== -1) {
			return;
		}
		this[selectedValues].push(newSelectedNick);
	}

	removeSelectedNickByName (selectedNick) {
		if (typeof selectedNick !== "string") {
			throw new Error("Invalid argument list for NickSessionConfiguration.removeSelectedNickByName");
		}
		for (let i = 0; i < this.getSelectedValues().length; i++) {
			if (this.getSelectedValues()[i] === selectedNick) {
				this[selectedValues].splice(i, 1);
				return;
			}
		}
	}

	removeSelectedNicks () {
		this[selectedValues] = [];
	}

	getBlockIllegal () {
		return this[blockIllegal];
	}

	setBlockIllegal (value) {
		if (typeof value !== "boolean") {
			throw new Error("Invalid argument list for NickSessionConfiguration.setBlockIllegal");
		}
		this[blockIllegal] = value;
	}

	getRestrictToCASLogin () {
		return this[restrictToCASLogin];
	}

	setRestrictToCASLogin (value) {
		if (typeof value !== "boolean") {
			throw new Error("Invalid argument list for NickSessionConfiguration.setRestrictToCASLogin");
		}
		this[restrictToCASLogin] = value;
	}
}
