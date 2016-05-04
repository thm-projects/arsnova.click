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

import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

export const EventManagerCollection = new Mongo.Collection("eventmanager");

const eventStackScheme = new SimpleSchema({
	key: {
		type: String
	},
	value: {
		type: Object,
		blackbox: true
	}
});

var eventManagerScheme = new SimpleSchema({
	hashtag: {
		type: String,
		min: 1,
		max: 25
	},
	sessionStatus: {
		type: Number,
		min: 0,
		max: 3
	},
	lastConnection: {
		type: Number
	},
	readingConfirmationIndex: {
		type: Number,
		min: -1,
		optional: true
	},
	questionIndex: {
		type: Number,
		min: -1,
		optional: true
	},
	eventStack: {
		type: [eventStackScheme]
	}
});

EventManagerCollection.attachSchema(eventManagerScheme);
