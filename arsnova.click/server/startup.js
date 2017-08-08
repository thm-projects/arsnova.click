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
import {HTTP} from 'meteor/http';
import {TAPi18n} from 'meteor/tap:i18n';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import {BannedNicksCollection} from '/lib/banned_nicks/collection.js';
import {NicknameCategoriesCollection} from '/lib/nickname_categories/collection.js';
import {forbiddenNicks} from './forbiddenNicks.js';
import {nickCategories} from './nickCategories.js';
import {themes} from '/shared/themes.js';
import phantomjs from 'phantomjs-prebuilt';
import * as childProcess from 'child_process';
import process from 'process';
import mkdirp from 'mkdirp';
import {download} from "./lib";

if (Meteor.isServer) {
	Meteor.startup(function () {
		if (Meteor.settings.serverStartup.verbose) {
			console.log("server startup: Running server startup...");
			console.log("server startup: create htmlAttributeHook...");
		}
		WebApp.addHtmlAttributeHook(function () {
			return {"lang": "de"};
		});
		if (Meteor.settings.serverStartup.verbose) {
			console.log("server startup: htmlAttributeHook created successfully");
		}
		if (HashtagsCollection && !HashtagsCollection.findOne()) {
			// block this hash / pk -> do not use and merge to production server!
			const blockedHashtag1 = {
				hashtag: "hashtags",
				privateKey: new Mongo.ObjectID()._str
			};
			const blockedHashtag2 = {
				hashtag: "privateKey",
				privateKey: new Mongo.ObjectID()._str
			};
			const blockedHashtag3 = {
				hashtag: "ImportFromARSnova",
				privateKey: new Mongo.ObjectID()._str
			};
			if (Meteor.settings.serverStartup.verbose) {
				console.log("server startup: inserting blocking hashtags...");
			}
			HashtagsCollection.insert(blockedHashtag1);
			HashtagsCollection.insert(blockedHashtag2);
			HashtagsCollection.insert(blockedHashtag3);

			if (Meteor.settings.serverStartup.verbose) {
				console.log("server startup: inserted blocking hashtags successfully");
			}
		}
		if (Meteor.settings.serverStartup.verbose) {
			console.log("server startup: inserting banned nicknames...");
		}
		if (BannedNicksCollection && !BannedNicksCollection.findOne()) {
			forbiddenNicks.forEach(function (item) {
				BannedNicksCollection.insert({userNick: item});
			});
		}
		if (Meteor.settings.serverStartup.verbose) {
			console.log("server startup: inserted banned nicknames successfully");
			console.log("server startup: inserting nick categories...");
		}
		nickCategories.forEach(function (item) {
			if (!NicknameCategoriesCollection.findOne({nick: item.nick})) {
				NicknameCategoriesCollection.insert({
					nick: item.nick,
					nickCategory: item.nickCategory,
					insertDate: new Date(),
					lastUsedDate: new Date()
				});
			}
		});
		if (Meteor.settings.serverStartup.verbose) {
			console.log("server startup: manipulating nicknames on selected nickname categories...");
		}
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
		if (Meteor.settings.serverStartup.verbose) {
			console.log("server startup: inserted nick categories successfully");
			console.log("server startup: removing old connection status documents");
		}
		if (Meteor.settings.serverStartup.verbose) {
			console.log("server startup: removed old connection status documents successfully");
			console.log("server startup: generating preview images of all themes in all languages");
		}
		if (Meteor.settings.serverStartup.themeScreenshots) {
			const spawn = childProcess.spawn,
				languages = TAPi18n.getLanguages(),
				params = [process.cwd() + '/assets/app/phantomDriver.js'];
			themes.forEach(function (theme) {
				for (const languageKey in languages) {
					if (languages.hasOwnProperty(languageKey)) {
						params.push(Meteor.absoluteUrl() + "preview/" + theme.id + "/" + languageKey);
					}
				}
			});
			const checkServerStatusInterval = Meteor.setInterval(function () {
				HTTP.call("GET", Meteor.absoluteUrl(), function (error) {
					if (!error) {
						Meteor.clearInterval(checkServerStatusInterval);
						const command = spawn(phantomjs.path, params);
						command.stdout.on("data", function (data) {
							if (Meteor.settings.serverStartup.verbose) {
								console.log("phantomjs (stdout):", data.toString());
							}
						});
						command.stderr.on("data", function (data) {
							if (Meteor.settings.serverStartup.verbose) {
								console.log("phantomjs (stderr):", data.toString());
							}
						});
						command.on('exit', function () {
							if (Meteor.settings.serverStartup.verbose) {
								console.log("server startup: all preview images have been generated");
							}
						});
						console.log("server startup: Server startup successful.");
					}
				});
			}, 800);
		}
		if (Meteor.settings.public.useLocalAssetsCache) {
			mkdirp(`${process.cwd()}/lib/mathjax/`, function () {
				download(Meteor.settings.public.mathjaxUrl, `${process.cwd()}/lib/mathjax/MathJax.js`);
			});
			mkdirp(`${process.cwd()}/lib/font/`, function () {
				download(Meteor.settings.public.fontUrl, `${process.cwd()}/lib/font/Font.css`);
			});
		}
	});
}
