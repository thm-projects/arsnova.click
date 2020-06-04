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

import {EJSON} from 'meteor/ejson';
import {AbstractSessionConfiguration} from './session_config_abstract.js';

export class SessionConfiguration extends AbstractSessionConfiguration {
	constructor(options) {
		super(options);
	}

	clone() {
		return new SessionConfiguration(this.serialize());
	}

	typeName() {
		return "SessionConfiguration";
	}
}

/**
 * Adds a custom type to Meteor's EJSON
 * @see http://docs.meteor.com/api/ejson.html#EJSON-addType
 */
EJSON.addType("SessionConfiguration", function (value) {
	return new SessionConfiguration(value);
});
