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
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import {MusicSessionConfiguration} from '/lib/session_configuration/session_config_music.js';
import {NickSessionConfiguration} from '/lib/session_configuration/session_config_nicks.js';

Meteor.methods({
	"SessionConfiguration.setMusic": function (configObject) {
		if (Meteor.isClient && configObject instanceof MusicSessionConfiguration) {
			configObject = configObject.serialize();
		}
		const hashtag = configObject.hashtag;
		delete configObject.hashtag;
		SessionConfigurationCollection.update(hashtag, {$set: {"music": configObject}}, {upsert: true});
	},
	"SessionConfiguration.setNicks": function (configObject) {
		if (Meteor.isClient && configObject instanceof NickSessionConfiguration) {
			configObject = configObject.serialize();
		}
		const hashtag = configObject.hashtag;
		delete configObject.hashtag;
		SessionConfigurationCollection.update(hashtag, {$set: {"nicks": configObject}}, {upsert: true});
	},
	"SessionConfiguration.setTheme": function (hashtag, theme) {
		SessionConfigurationCollection.update(hashtag, {$set: {"theme": theme}}, {upsert: true});
	},
	"SessionConfiguration.setReadingConfirmationEnabled": function (hashtag, readingConfirmationEnabled) {
		SessionConfigurationCollection.update(hashtag, {$set: {"readingConfirmationEnabled": readingConfirmationEnabled}}, {upsert: true});
	}
});
