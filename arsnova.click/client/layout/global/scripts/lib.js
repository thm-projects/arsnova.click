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
import {Tracker} from 'meteor/tracker';
import {Router} from 'meteor/iron:router';
import {TAPi18n} from 'meteor/tap:i18n';
import {introJs} from 'meteor/arsnova.click:introjs';

let pendingAnimationRunning = false;
const standardAnimationDelay = 200;
const standardFadeInAnimationTime = 150;
const timeoutHolder = [];

export const connectionStatus = {};
connectionStatus.webSocket = {
	connected: true
};
connectionStatus.localStorage = true;
connectionStatus.sessionStorage = true;
connectionStatus.dbConnection = {
	totalCount: 5,
	currentCount: 5,
	serverRTT: 1,
	serverRTTtotal: 1
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

export function checkABCDOrdering(data) {
	let ordered = true;
	if (!data || data.length < 2 || data.charAt(0) !== 'a') {
		return false;
	}
	for (let i = 1; i < data.length; i++) {
		if (data.charCodeAt(i) !== data.charCodeAt(i - 1) + 1) {
			ordered = false;
			break;
		}
	}
	return ordered;
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
	connectionStatus.dbConnection.totalCount = 5;
	connectionStatus.dbConnection.currentCount = 1;
	connectionStatus.dbConnection.serverRTT = 0;
	connectionStatus.dbConnection.serverRTTtotal = 0;
	hasRunConnectionStatus = false;
	clearTimeout(restartTimeout);
	restartTimeout = null;
}

export function startConnectionIndication() {
	if (Router.current() && Router.current().route.getName() === "preview.:themeName.:language") {
		return;
	}
	connectionStatus.webSocket = Meteor.status();
	connectionStatus.localStorage = false;
	connectionStatus.sessionStorage = false;
	connectionStatus.dbConnection = {
		totalCount: 5,
		currentCount: 1,
		serverRTT: 0,
		serverRTTtotal: 0
	};
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
	Session.set("connectionStatus", connectionStatus);
}

export function getRTT() {
	if (Router.current() && Router.current().route.getName() === "preview.:themeName.:language") {
		return;
	}
	startTime = new Date().getTime();
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
		navigator.vibrate(100);
	}
}

export function getTooltipForRoute(overridePreference = false) {
	let hasStartedIntroJs = false;
	const introState = $.parseJSON(localStorage.getItem("intro_state")) || {};
	const route = Router.current().route.getName();
	Tracker.autorun(function () {
		if ($(window).width() <= 768) {
			return;
		}
		if (!introState[route]) {
			introState[route] = {completed: false, elements: {}};
			localStorage.setItem("intro_state", JSON.stringify(introState));
		}
		if (hasStartedIntroJs || Session.get("loading_language") || (introState[route].completed && !overridePreference)) {
			return;
		}
		hasStartedIntroJs = true;
		const customIntroJs = introJs().setOptions({
			'overlayOpacity': 0,
			'tooltipPosition': 'auto',
			'hidePrev': true,
			'hideNext': true,
			'showStepNumbers': false,
			'showBullets': false,
			'showProgress': false,
			'exitOnOverlayClick': true,
			'keyboardNavigation': false,
			'disableInteraction': false,
			'nextLabel': " > ",
			'prevLabel': " < ",
			'scrollToElement': true,
			'doneLabel': TAPi18n.__("global.close_window"),
			'skipLabel': TAPi18n.__("global.close_window")
		}).onafterchange(function (targetElement) {
			introState[route].elements[targetElement.id] = true;
			localStorage.setItem("intro_state", JSON.stringify(introState));
		}).oncomplete(function () {
			introState[route].completed = true;
			hasStartedIntroJs = false;
			localStorage.setItem("intro_state", JSON.stringify(introState));
		});
		const alreadyVisitedElements = Object.keys(introState[route].elements).length;
		if (alreadyVisitedElements > 0) {
			customIntroJs.goToStep(alreadyVisitedElements).start();
		} else {
			customIntroJs.start();
		}
	});
}

/**
 * Resets a given input[type=file] field
 * @see http://stackoverflow.com/a/22506053
 * @param ctrl The input field
 */
export function clearFileInput(ctrl) {
	try {
		ctrl.value = null;
	} catch (ex) {
	}
	if (ctrl.value) {
		ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
	}
}

