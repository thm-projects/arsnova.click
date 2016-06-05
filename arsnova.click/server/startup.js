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
import {Mongo} from 'meteor/mongo';
import {WebApp} from 'meteor/webapp';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import {BannedNicksCollection} from '/lib/banned_nicks/collection.js';
import {forbiddenNicks} from './forbiddenNicks.js';

if (Meteor.isServer) {
	Meteor.startup(function () {
		WebApp.addHtmlAttributeHook(function () {
			return {"lang": "de"};
		});
		if (HashtagsCollection && !HashtagsCollection.findOne()) {
			// block this hash / pk -> do not use and merge to production server!
			var blockedHashtag1 = {
				hashtag: "hashtags",
				privateKey: new Mongo.ObjectID()._str,
				sessionStatus: 0,
				lastConnection: (new Date()).getTime(),
				musicVolume: 0,
				musicEnabled: 0,
				musicTitle: "noSong",
				theme: "theme-default"
			};
			// block this hash / pk -> do not use and merge to production server!
			var blockedHashtag2 = {
				hashtag: "privateKey",
				privateKey: new Mongo.ObjectID()._str,
				sessionStatus: 0,
				lastConnection: (new Date()).getTime(),
				musicVolume: 0,
				musicEnabled: 0,
				musicTitle: "noSong",
				theme: "theme-default"
			};

			HashtagsCollection.insert(blockedHashtag1);
			HashtagsCollection.insert(blockedHashtag2);
		}
		if (BannedNicksCollection && !BannedNicksCollection.findOne()) {
			forbiddenNicks.forEach(function (item) {
				BannedNicksCollection.insert({userNick: item});
			});
		}
	});
}
