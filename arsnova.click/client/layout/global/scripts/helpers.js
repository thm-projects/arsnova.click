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

Template.connectionQualityHeader.helpers({
	status: function () {
		if (!Session.get("connectionStatus")) {
			return;
		}
		if (Session.get("connectionStatus").dbConnection.currentCount < Session.get("connectionStatus").dbConnection.totalCount) {
			return {
				resultString: "region.header.connection_status.pending",
				pending: true
			};
		}
		const result = {
			ready: true,
			errors: [],
			warnings: []
		};
		if (!Session.get("connectionStatus").webSocket.connected) {
			result.errors.push("webSocket");
		}
		if (!Session.get("connectionStatus").localStorage) {
			result.errors.push("localStorage");
		}
		if (!Session.get("connectionStatus").sessionStorage) {
			result.errors.push("sessionStorage");
		}
		if (Session.get("connectionStatus").dbConnection.currentCount < Session.get("connectionStatus").dbConnection.totalCount) {
			if (Session.get("connectionStatus").dbConnection.serverRTT > 20) {
				result.errors.push("dbConnection");
			} else if (Session.get("connectionStatus").dbConnection.serverRTT > 10) {
				result.warnings.push("dbConnection");
			}
		}
		if (result.errors.length > 0) {
			return $.extend({resultString: "region.header.connection_status.finished_with_errors"}, result, {finishedWithErrors: true});
		}
		if (result.warnings.length > 0) {
			return $.extend({resultString: "region.header.connection_status.finished_with_warnings"}, result, {finishedWithWarnings: true});
		}
		$('#connectionQualityHeader').delay(3000).fadeOut(1000);
		return {resultString: "region.header.connection_status.finished_without_warnings", finishedWithoutWarnings: true};
	}
});
