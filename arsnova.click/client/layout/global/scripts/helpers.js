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
import {hashtagSchema} from '/lib/hashtags/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import * as localData from '/lib/local_storage.js';
import * as lib from './lib.js';

Template.layout.helpers({
	getTheme: function () {
		const configDoc = SessionConfigurationCollection.findOne();
		if (configDoc) {
			const theme = configDoc.theme;
			Session.set("theme", theme);
		}
		return Session.get("theme");
	}
});

Template.connectionQualityHeader.helpers({
	status: function () {
		if (!Meteor.status().connected) {
			return {
				resultString: "region.header.connection_status.websocket_status.disconnected",
				ready: true,
				statusClass: "Offline"
			};
		}
		if (!Session.get("connectionStatus") || Session.get("connectionStatus").dbConnection.currentCount < Session.get("connectionStatus").dbConnection.totalCount) {
			lib.startPendingAnimation();
			return {
				resultString: "region.header.connection_status.pending",
				pending: true,
				statusClass: "Pending"
			};
		}
		const result = {
			ready: true,
			failures: [],
			errors: [],
			warnings: []
		};
		if (!Session.get("connectionStatus").localStorage) {
			result.errors.push("localStorage");
		}
		if (!Session.get("connectionStatus").sessionStorage) {
			result.errors.push("sessionStorage");
		}
		if (Session.get("connectionStatus").dbConnection.serverRTT > 150) {
			result.failures.push("dbConnection");
		} else if (Session.get("connectionStatus").dbConnection.serverRTT > 100) {
			result.errors.push("dbConnection");
		} else if (Session.get("connectionStatus").dbConnection.serverRTT > 50) {
			result.warnings.push("dbConnection");
		}
		lib.stopPendingAnimation();
		if (result.failures.length > 0) {
			return $.extend({resultString: "region.header.connection_status.finished_with_errors"}, result, {finishedWithErrors: true, statusClass: "Failed"});
		}
		if (result.errors.length > 0) {
			return $.extend({resultString: "region.header.connection_status.finished_with_errors"}, result, {finishedWithErrors: true, statusClass: "Error"});
		}
		if (result.warnings.length > 0) {
			return $.extend({resultString: "region.header.connection_status.finished_with_warnings"}, result, {finishedWithWarnings: true, statusClass: "Warning"});
		}
		return {resultString: "region.header.connection_status.finished_without_warnings", finishedWithoutWarnings: true, statusClass: "Ok"};
	}
});

Template.home.helpers($.extend({getHashtagSchema: hashtagSchema}, {
    isAddingDemoQuiz: function () {
        return Session.get("isAddingQuizType") === "demoquiz";
    },
	isAddingABCDQuiz: function () {
        return Session.get("isAddingQuizType") === "abcd";
    },
	isEditingQuiz: function () {
		return Session.get("isEditingQuiz");
	},
	hasDemoQuiz: function () {
		let hasDemoQuiz = false;
		$.each(localData.getAllHashtags(), function (index, item) {
			if (item.toLowerCase().indexOf("demo quiz") !== -1) {
				hasDemoQuiz = true;
				return false;
			}
		});
		return hasDemoQuiz;
	}
}));
