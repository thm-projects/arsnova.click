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
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {ConnectionStatusCollection} from '/lib/connection/collection.js';
import {HashtagsCollection} from '/lib/hashtags/collection.js';
import  * as localData from '/lib/local_storage.js';
import {Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as hashtagLib from '/client/layout/view_hashtag_management/scripts/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";

Template.home.onRendered(function () {
	const connectionStatus = {
		webSocket: Meteor.status(),
		localStorage: false,
		sessionStorage: false,
		dbConnection: {
			totalCount: 15,
			currentCount: 1,
			serverRTT: 0,
			serverRTTtotal: 0
		}
	};
	try {
		localStorage.setItem("localStorageAvailable", true);
		connectionStatus.localStorage = true;
	} catch (ex) {
		connectionStatus.localStorage = false;
	}
	try {
		sessionStorage.setItem("sessionStorageAvailable", true);
		connectionStatus.sessionStorage = true;
	} catch (ex) {
		connectionStatus.sessionStorage = false;
	}
	let startTime = 0;
	let randomKey = 0;
	const getRTT = function () {
		randomKey = Math.random().toString(36).replace(/[^a-z]+/g, '');
		startTime = new Date().getTime();
		Meteor.call("Connection.sendConnectionStatus", randomKey);
	};
	ConnectionStatusCollection.find().observeChanges({
		added: function (id, doc) {
			if (doc.key === randomKey) {
				connectionStatus.dbConnection.serverRTTtotal = (connectionStatus.dbConnection.serverRTTtotal + (new Date().getTime() - startTime));
				connectionStatus.dbConnection.serverRTT = 1 / connectionStatus.dbConnection.currentCount * connectionStatus.dbConnection.serverRTTtotal;
				Meteor.call("Connection.receivedConnectionStatus", randomKey);
				if (connectionStatus.dbConnection.currentCount < connectionStatus.dbConnection.totalCount) {
					connectionStatus.dbConnection.currentCount++;
					setTimeout(getRTT, 200);
				} else {
					/* Restart the countdown process every minute and fire 5 insertion events */
					setTimeout(function () {
						connectionStatus.dbConnection.totalCount = 15;
						connectionStatus.dbConnection.currentCount = 1;
						connectionStatus.dbConnection.serverRTT = 0;
						connectionStatus.dbConnection.serverRTTtotal = 0;
						getRTT();
					}, 30000);
				}
				Session.set("connectionStatus", connectionStatus);
			}
		}
	});
	Session.set("connectionStatus", connectionStatus);
	getRTT();

	HashtagsCollection.find().observeChanges({
		added: function (id, doc) {
			if (doc.hashtag === $("#hashtag-input-field").val()) {
				$("#addNewHashtag").attr("disabled", "disabled");
			}
		}
	});
	if (localData.getAllHashtags().length > 0) {
		hashtagLib.setHashtagSplashscreen(new Splashscreen({
			autostart: true,
			templateName: "showHashtagsSplashscreen"
		}));
	}

	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemAbout);
	footerElements.addFooterElement(footerElements.footerElemTranslation);
	footerElements.addFooterElement(footerElements.footerElemTheme);
	footerElements.addFooterElement(footerElements.footerElemFullscreen);
	footerElements.addFooterElement(footerElements.footerElemImport);
	footerElements.calculateFooter();
});

Template.layout.helpers({
	getTheme: function () {
		return Session.get("theme");
	}
});
