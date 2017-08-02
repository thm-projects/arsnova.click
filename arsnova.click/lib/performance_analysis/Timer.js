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
import {PerformanceAnalysisCollection} from '/lib/performance_analysis/collection.js';

const deviceType = Meteor.isServer ? "server" : $(window).width() >= 992 ? "desktop" : Meteor.isCordova ? "mobile-cordova" : "mobile-browser";

const actionGroup = Symbol("actionGroup");
const startTime = Symbol("startTime");
const endTime = Symbol("endTime");

class Timer {
	constructor(action) {
		this[actionGroup] = action;
	}

	start() {
		if (!(this[startTime])) {
			this[startTime] = Date.now();
		}
	}

	end() {
		if (!(this[endTime])) {
			this[endTime] = Date.now();
		}
	}

	getTimeDiff() {
		const timeDiff = this[endTime] - this[startTime];
		if (isNaN(timeDiff)) {
			return -1;
		}
		return timeDiff;
	}
}

export const TimerMap = {
	"initLoad": new Timer("initLoad"),
	"clickOnNicknameForward": new Timer("clickOnNicknameForward"),
	"routeToVotingView": new Timer("routeToVotingView"),
	"clickOnResponseButton": new Timer("clickOnResponseButton"),
	"routeToLiveResults": new Timer("routeToLiveResults"),
	"routeToLeaderboard": new Timer("routeToLeaderboard")
};

GetTimerMap = function () {
	return TimerMap;
};

FinalizeTimers = function () {
	for (const actionGroup in TimerMap) {
		if (TimerMap.hasOwnProperty(actionGroup)) {
			if (TimerMap[actionGroup].getTimeDiff() > 0) {
				Meteor.call("PerformanceAnalysisCollection.addItem", actionGroup, TimerMap[actionGroup].getTimeDiff(), deviceType);
			}
		}
	}
};

AnalyzeTimers = function () {
	const mobileBrowserTimers = PerformanceAnalysisCollection.find({device: "mobile-browser"}).fetch();
	const mobileCordovaTimers = PerformanceAnalysisCollection.find({device: "mobile-cordova"}).fetch();
	const desktopTimers = PerformanceAnalysisCollection.find({device: "desktop"}).fetch();

	const initLoadTimers = PerformanceAnalysisCollection.find({actionGroup: "initLoad"}).fetch();
	const clickOnNicknameForwardTimers = PerformanceAnalysisCollection.find({actionGroup: "clickOnNicknameForward"}).fetch();
	const routeToVotingViewTimers = PerformanceAnalysisCollection.find({actionGroup: "routeToVotingView"}).fetch();
	const clickOnResponseButtonTimers = PerformanceAnalysisCollection.find({actionGroup: "clickOnResponseButton"}).fetch();
	const routeToLiveResultsTimers = PerformanceAnalysisCollection.find({actionGroup: "routeToLiveResults"}).fetch();
	const routeToLeaderboardTimers = PerformanceAnalysisCollection.find({actionGroup: "routeToLeaderboard"}).fetch();

	const result = {
		mobileBrowserTimers: {
			overallTimeDiff: 0,
			averageTimeDiff: 0,
			elementCount: mobileBrowserTimers.length,
			rawData: mobileBrowserTimers
		},
		mobileCordovaTimers: {
			overallTimeDiff: 0,
			averageTimeDiff: 0,
			elementCount: mobileCordovaTimers.length,
			rawData: mobileCordovaTimers
		},
		desktopTimers: {
			overallTimeDiff: 0,
			averageTimeDiff: 0,
			elementCount: desktopTimers.length,
			rawData: desktopTimers
		},
		actionGroupTimers: {
			"initLoad": {
				overallTimeDiff: 0,
				averageTimeDiff: 0,
				elementCount: initLoadTimers.length,
				rawData: initLoadTimers
			},
			"clickOnNicknameForward": {
				overallTimeDiff: 0,
				averageTimeDiff: 0,
				elementCount: clickOnNicknameForwardTimers.length,
				rawData: clickOnNicknameForwardTimers
			},
			"routeToVotingView": {
				overallTimeDiff: 0,
				averageTimeDiff: 0,
				elementCount: routeToVotingViewTimers.length,
				rawData: routeToVotingViewTimers
			},
			"clickOnResponseButton": {
				overallTimeDiff: 0,
				averageTimeDiff: 0,
				elementCount: clickOnResponseButtonTimers.length,
				rawData: clickOnResponseButtonTimers
			},
			"routeToLiveResults": {
				overallTimeDiff: 0,
				averageTimeDiff: 0,
				elementCount: routeToLiveResultsTimers.length,
				rawData: routeToLiveResultsTimers
			},
			"routeToLeaderboard": {
				overallTimeDiff: 0,
				averageTimeDiff: 0,
				elementCount: routeToLeaderboardTimers.length,
				rawData: routeToLeaderboardTimers
			}
		},
		rawData: PerformanceAnalysisCollection.find().fetch()
	};

	mobileBrowserTimers.forEach(function (item) {
		result.mobileBrowserTimers.overallTimeDiff += item.timeDiff;
	});
	mobileCordovaTimers.forEach(function (item) {
		result.mobileCordovaTimers.overallTimeDiff += item.timeDiff;
	});
	desktopTimers.forEach(function (item) {
		result.desktopTimers.overallTimeDiff += item.timeDiff;
	});
	initLoadTimers.forEach(function (item) {
		result.actionGroupTimers.initLoad.overallTimeDiff += item.timeDiff;
	});
	clickOnNicknameForwardTimers.forEach(function (item) {
		result.actionGroupTimers.clickOnNicknameForward.overallTimeDiff += item.timeDiff;
	});
	routeToVotingViewTimers.forEach(function (item) {
		result.actionGroupTimers.routeToVotingView.overallTimeDiff += item.timeDiff;
	});
	clickOnResponseButtonTimers.forEach(function (item) {
		result.actionGroupTimers.clickOnResponseButton.overallTimeDiff += item.timeDiff;
	});
	routeToLiveResultsTimers.forEach(function (item) {
		result.actionGroupTimers.routeToLiveResults.overallTimeDiff += item.timeDiff;
	});
	routeToLeaderboardTimers.forEach(function (item) {
		result.actionGroupTimers.routeToLeaderboard.overallTimeDiff += item.timeDiff;
	});

	result.mobileBrowserTimers.averageTimeDiff = result.mobileBrowserTimers.overallTimeDiff / result.mobileBrowserTimers.elementCount;
	result.mobileCordovaTimers.averageTimeDiff = result.mobileCordovaTimers.overallTimeDiff / result.mobileCordovaTimers.elementCount;
	result.desktopTimers.averageTimeDiff = result.desktopTimers.overallTimeDiff / result.desktopTimers.elementCount;
	result.actionGroupTimers.initLoad.averageTimeDiff = result.actionGroupTimers.initLoad.overallTimeDiff / result.actionGroupTimers.initLoad.elementCount;
	result.actionGroupTimers.clickOnNicknameForward.averageTimeDiff = result.actionGroupTimers.clickOnNicknameForward.overallTimeDiff / result.actionGroupTimers.clickOnNicknameForward.elementCount;
	result.actionGroupTimers.routeToVotingView.averageTimeDiff = result.actionGroupTimers.routeToVotingView.overallTimeDiff / result.actionGroupTimers.routeToVotingView.elementCount;
	result.actionGroupTimers.clickOnResponseButton.averageTimeDiff = result.actionGroupTimers.clickOnResponseButton.overallTimeDiff / result.actionGroupTimers.clickOnResponseButton.elementCount;
	result.actionGroupTimers.routeToLiveResults.averageTimeDiff = result.actionGroupTimers.routeToLiveResults.overallTimeDiff / result.actionGroupTimers.routeToLiveResults.elementCount;
	result.actionGroupTimers.routeToLeaderboard.averageTimeDiff = result.actionGroupTimers.routeToLeaderboard.overallTimeDiff / result.actionGroupTimers.routeToLeaderboard.elementCount;

	return result;
};
