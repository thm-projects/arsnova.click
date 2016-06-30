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
import {ConnectionStatusCollection} from '/lib/connection/collection.js';

let pendingAnimationRunning = false;
const standardAnimationDelay = 200;
const standardFadeInAnimationTime = 150;
const timeoutHolder = [];

export const connectionStatus = {
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
let hasRunConnectionStatus = false;
let hasRestarted = false;
let restartTimeout = null;
let startTime = 0;
let randomKey = 0;

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

function getRTT() {
	randomKey = Math.random().toString(36).replace(/[^a-z]+/g, '');
	startTime = new Date().getTime();
	Meteor.call("Connection.sendConnectionStatus", randomKey);
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
	ConnectionStatusCollection.find().observeChanges({
		added: function (id, doc) {
			if (doc.key === randomKey) {
				connectionStatus.dbConnection.serverRTTtotal = (connectionStatus.dbConnection.serverRTTtotal + (new Date().getTime() - startTime));
				connectionStatus.dbConnection.serverRTT = 1 / connectionStatus.dbConnection.currentCount * connectionStatus.dbConnection.serverRTTtotal;
				Meteor.call("Connection.receivedConnectionStatus", randomKey);
				if (connectionStatus.dbConnection.currentCount < connectionStatus.dbConnection.totalCount) {
					connectionStatus.dbConnection.currentCount++;
					setTimeout(getRTT, 200);
				} else if (!hasRestarted && !restartTimeout) {
					hasRestarted = true;
					restartTimeout = setTimeout(restartConnectionIndication, 30000);
				}
				Session.set("connectionStatus", connectionStatus);
			}
		}
	});
	Session.set("connectionStatus", connectionStatus);
	getRTT();
}

export function restartConnectionIndication() {
	connectionStatus.dbConnection.totalCount = 15;
	connectionStatus.dbConnection.currentCount = 1;
	connectionStatus.dbConnection.serverRTT = 0;
	connectionStatus.dbConnection.serverRTTtotal = 0;
	hasRunConnectionStatus = false;
	hasRestarted = false;
	startConnectionIndication();
}
