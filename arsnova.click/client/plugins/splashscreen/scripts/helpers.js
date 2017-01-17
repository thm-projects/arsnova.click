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

import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {hashtagSchema} from '/lib/hashtags/collection.js';
import * as localData from '/lib/local_storage.js';
import * as headerLib from '/client/layout/region_header/lib.js';
import {isMobileDevice, parseMarkdown} from './lib.js';

Template.splashscreen.helpers($.extend(isMobileDevice, {

}));

Template.kickMemberSplashscreen.helpers($.extend(isMobileDevice, {

}));

Template.deleteConfirmationSplashscreen.helpers($.extend(isMobileDevice, {

}));

Template.resetSessionSplashscreen.helpers($.extend(isMobileDevice, {
	isEditingQuestion: headerLib.isEditingQuestion
}));

Template.exitSessionSplashscreen.helpers($.extend(isMobileDevice, {

}));

Template.errorSplashscreen.helpers($.extend(isMobileDevice, {

}));

Template.showHashtagsSplashscreen.helpers($.extend(isMobileDevice, {
	hashtags: function () {
		return localData.getAllHashtags();
	},
	isValid: function (sessionName) {
		return localData.reenterSession(sessionName).isValid();
	}
}));

Template.readingConfirmedSplashscreen.helpers($.extend(isMobileDevice, parseMarkdown, {

}));

Template.questionAndAnswerSplashscreen.helpers($.extend(isMobileDevice, parseMarkdown, {
	revealAnswerText: function () {
		const templateData = Template.instance().data;
		if (!templateData) {
			return;
		}
		return templateData.revealCorrectValues !== false && (!Session.get("countdownInitialized") || Session.get("sessionClosed"));
	}
}));

Template.renameHashtagSplashscreen.helpers($.extend(isMobileDevice, {getHashtagSchema: hashtagSchema}, {
	isArsnovaImport: function () {
		return Template.instance().data.hashtag === "ImportFromArsnova";
	}
}));

Template.connectionQualitySplashscreen.helpers($.extend(isMobileDevice, {
	websocketStatus: function () {
		return {
			text: Session.get("connectionStatus").webSocket.connected ? "region.header.connection_status.websocket_status.connected" : "region.header.connection_status.websocket_status.disconnected"
		};
	},
	localStorageStatus: function () {
		return {
			text: Session.get("connectionStatus").localStorage ? "region.header.connection_status.localStorage_status.writable" : "region.header.connection_status.localStorage_status.non_writable"
		};
	},
	sessionStorageStatus: function () {
		return {
			text: Session.get("connectionStatus").sessionStorage ? "region.header.connection_status.sessionStorage_status.writable" : "region.header.connection_status.sessionStorage_status.non_writable"
		};
	},
	dbConnectionStatus: function () {
		return {
			text: Session.get("connectionStatus").dbConnection.currentCount < Session.get("connectionStatus").dbConnection.totalCount ? "region.header.connection_status.pending" :
					Session.get("connectionStatus").dbConnection.serverRTT > 100 ? "region.header.connection_status.dbConnection_status.very_slow" :
					Session.get("connectionStatus").dbConnection.serverRTT > 60 ? "region.header.connection_status.dbConnection_status.slow" :
					"region.header.connection_status.dbConnection_status.ok",
			averageTime: Session.get("connectionStatus").dbConnection.serverRTT.toFixed(2).replace(".", ","),
			current: Session.get("connectionStatus").dbConnection.currentCount,
			max: Session.get("connectionStatus").dbConnection.totalCount
		};
	},
	hasNetworkConnection: function () {
		return Session.get("connectionStatus").webSocket.connected;
	}
}));
