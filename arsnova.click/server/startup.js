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
import {NicknameCategoriesCollection} from '/lib/nickname_categories/collection.js';
import {forbiddenNicks} from './forbiddenNicks.js';
import {nickCategories} from './nickCategories.js';

if (Meteor.isServer) {
	Meteor.startup(function () {
		console.log("Running server startup...")
		console.log("create htmlAttributeHook...");
		WebApp.addHtmlAttributeHook(function () {
			return {"lang": "de"};
		});
		console.log("htmlAttributeHook created successfully");
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
				theme: "theme-default",
				selectedNicks: []
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
				theme: "theme-default",
				selectedNicks: []
			};
			console.log("inserting blocking hashtags...");
			HashtagsCollection.insert(blockedHashtag1);
			HashtagsCollection.insert(blockedHashtag2);

			console.log("inserted blocking hashtags successfully");
		}
		console.log("inserting banned nicknames...");
		if (BannedNicksCollection && !BannedNicksCollection.findOne()) {
			forbiddenNicks.forEach(function (item) {
				BannedNicksCollection.insert({userNick: item});
			});
		}
		console.log("inserted banned nicknames successfully");
		console.log("inserting nick categories...");
		nickCategories.forEach(function (item) {
			if (!NicknameCategoriesCollection.findOne({nick: item.nick})) {
				NicknameCategoriesCollection.insert({nick: item.nick, nickCategory: item.nickCategory, insertDate: new Date(), lastUsedDate: new Date()});
			}
		});
		console.log("manipulating nicknames on selected nickname categories...")
		NicknameCategoriesCollection.find().fetch().forEach(function (item) {
			let foundItem = false;
			for (let i = 0; i < nickCategories.length; i++) {
				if (nickCategories[i].nick === item.nick) {
					foundItem = true;
					i = nickCategories.length;
				}
			}
			if (!foundItem) {
				NicknameCategoriesCollection.remove({nick: item.nick});
			}
		});
		console.log("inserted nick categories successfully");
		console.log("Server startup successful.")
	});
}
