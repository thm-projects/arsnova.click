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
	"SessionConfiguration.addConfig": function (sessionConfigObject) {
		if (Meteor.isClient && sessionConfigObject instanceof NickSessionConfiguration) {
			sessionConfigObject = sessionConfigObject.serialize();
		}
		SessionConfigurationCollection.update({hashtag: sessionConfigObject.hashtag}, {$set: {
			hashtag: sessionConfigObject.hashtag,
			music: sessionConfigObject.music,
			nicks: sessionConfigObject.nicks,
			theme: sessionConfigObject.theme,
			readingConfirmationEnabled: sessionConfigObject.readingConfirmationEnabled
		}}, {upsert: true});
	},
	"SessionConfiguration.setConfig": function (sessionConfigObject) {
		if (Meteor.isClient && sessionConfigObject instanceof NickSessionConfiguration) {
			sessionConfigObject = sessionConfigObject.serialize();
		}
		SessionConfigurationCollection.update({hashtag: sessionConfigObject.hashtag}, {$set: {
			hashtag: sessionConfigObject.hashtag,
			music: sessionConfigObject.music,
			nicks: sessionConfigObject.nicks,
			theme: sessionConfigObject.theme,
			readingConfirmationEnabled: sessionConfigObject.readingConfirmationEnabled
		}});
	},
	"SessionConfiguration.setMusic": function (configObject) {
		if (Meteor.isClient && configObject instanceof MusicSessionConfiguration) {
			configObject = configObject.serialize();
		}
		SessionConfigurationCollection.update({hashtag: configObject.hashtag}, {$set: {music: configObject.music}});
	},
	"SessionConfiguration.setNicks": function (configObject) {
		if (Meteor.isClient && configObject instanceof NickSessionConfiguration) {
			configObject = configObject.serialize();
		}
		SessionConfigurationCollection.update({hashtag: configObject.hashtag}, {$set: {nicks: configObject.nicks}});
	},
	"SessionConfiguration.setTheme": function (hashtag, theme) {
		SessionConfigurationCollection.update({hashtag: hashtag}, {$set: {"theme": theme}});
	},
	"SessionConfiguration.setReadingConfirmationEnabled": function (hashtag, readingConfirmationEnabled) {
		SessionConfigurationCollection.update({hashtag: hashtag}, {$set: {"readingConfirmationEnabled": readingConfirmationEnabled}});
	}
});
