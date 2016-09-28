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

let pendingAnimationRunning = false;
const standardAnimationDelay = 200;
const standardFadeInAnimationTime = 150;
const timeoutHolder = [];

export const connectionStatus = {
	webSocket: Meteor.status(),
	localStorage: false,
	sessionStorage: false,
	dbConnection: {
		totalCount: 5,
		currentCount: 1,
		serverRTT: 0,
		serverRTTtotal: 0
	}
};
let hasRunConnectionStatus = false;
let restartTimeout = null;
let startTime = 0;

function runPendingAnimation() {
	if (!pendingAnimationRunning) {
		return;
	}
	$('#secondRow, #thirdRow, #fourthRow').hide();
	timeoutHolder.push(setTimeout(function () {
		$('#secondRow').fadeIn(standardFadeInAnimationTime);
		timeoutHolder.push(setTimeout(function () {
			$('#thirdRow').fadeIn(standardFadeInAnimationTime);
			timeoutHolder.push(setTimeout(function () {
				$('#fourthRow').fadeIn(standardFadeInAnimationTime);
				timeoutHolder.push(setTimeout(function () {
					runPendingAnimation();
				}, standardAnimationDelay));
			}, standardAnimationDelay));
		}, standardAnimationDelay));
	}, standardAnimationDelay));
}

export function startPendingAnimation() {
	if (pendingAnimationRunning) {
		return;
	}
	pendingAnimationRunning = true;
	runPendingAnimation();
}

export function stopPendingAnimation() {
	if (!pendingAnimationRunning) {
		return;
	}
	pendingAnimationRunning = false;
	for (let i = 0; i < timeoutHolder.length; i++) {
		clearTimeout(timeoutHolder[i]);
	}
	$('#secondRow, #thirdRow, #fourthRow').show();
}

export function resetConnectionIndication() {
	connectionStatus.dbConnection.totalCount = 2;
	connectionStatus.dbConnection.currentCount = 1;
	connectionStatus.dbConnection.serverRTT = 0;
	connectionStatus.dbConnection.serverRTTtotal = 0;
	hasRunConnectionStatus = false;
	clearTimeout(restartTimeout);
	restartTimeout = null;
}

export function startConnectionIndication() {
	if (hasRunConnectionStatus) {
		return;
	}
	hasRunConnectionStatus = true;
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
	/*
	 ConnectionStatusCollection.find().observeChanges({
	 added: function (id, doc) {
	 if (doc.key === localData.getPrivateKey()) {
	 connectionStatus.dbConnection.serverRTTtotal = (connectionStatus.dbConnection.serverRTTtotal + (new Date().getTime() - startTime));
	 connectionStatus.dbConnection.serverRTT = 1 / connectionStatus.dbConnection.currentCount * connectionStatus.dbConnection.serverRTTtotal;
	 Meteor.call("Connection.receivedConnectionStatus", localData.getPrivateKey());
	 if (connectionStatus.dbConnection.currentCount < connectionStatus.dbConnection.totalCount) {
	 connectionStatus.dbConnection.currentCount++;
	 setTimeout(startRTT, 200);
	 }
	 Session.set("connectionStatus", connectionStatus);
	 }
	 }
	 });
	 */
	Session.set("connectionStatus", connectionStatus);
}

export function getRTT() {
	startTime = new Date().getTime();
	/*Meteor.call("Connection.sendConnectionStatus", localData.getPrivateKey());*/
	$.ajax({
		url: "/connection-test",
		cache: false,
		timeout: 10000,
		success: function () {
			connectionStatus.dbConnection.serverRTTtotal = (connectionStatus.dbConnection.serverRTTtotal + (new Date().getTime() - startTime));
			connectionStatus.dbConnection.serverRTT = 1 / connectionStatus.dbConnection.currentCount * connectionStatus.dbConnection.serverRTTtotal;
			if (connectionStatus.dbConnection.currentCount < connectionStatus.dbConnection.totalCount) {
				connectionStatus.dbConnection.currentCount++;
				setTimeout(getRTT, 200);
			} else if (!restartTimeout) {
				restartTimeout = setTimeout(function () {
					resetConnectionIndication();
					startConnectionIndication();
					getRTT();
				}, 180000);
			}
			Session.set("connectionStatus", connectionStatus);
		}
	});
}

export function forceFeedback() {
	if (navigator.vibrate) {
		navigator.vibrate(500);
	}
}
