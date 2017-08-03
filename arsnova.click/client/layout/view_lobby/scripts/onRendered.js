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
import {Router} from 'meteor/iron:router';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {MusicSessionConfiguration} from "/lib/session_configuration/session_config_music.js";
import * as localData from '/lib/local_storage.js';
import {setLobbySound, lobbySound} from '/client/plugins/sound/scripts/lib.js';
import {randomIntFromInterval} from '/client/layout/view_live_results/scripts/lib.js';
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {calculateButtonCount, memberlistTracker} from './lib.js';
import {getTooltipForRoute} from '/client/layout/global/scripts/lib.js';
import {TimerMap} from "/lib/performance_analysis/Timer.js";

Template.memberlist.onRendered(function () {
	Session.set("learnerCountOverride", false);
	Session.set("allMembersCount", MemberListCollection.find().count());

	$('.navbar-footer-placeholder').hide();
	$('.navbar-footer').show();

	$(document).on('keyup', function (event) {
		if (event.keyCode === 27) {
			$('.qr-code-container').hide();
		}
	});

	$(window).on("resize", function () {
		if (window.innerHeight != screen.height) {
			$('.navbar-footer-placeholder').hide();
			$('.navbar-footer').show();
		}
	});
	if (localData.containsHashtag(Router.current().params.quizName)) {
		const musicSettings = Session.get("questionGroup").getConfiguration().getMusicSettings();
		let songTitle = musicSettings.getLobbyTitle();
		if (songTitle === "Random") {
			songTitle = MusicSessionConfiguration.getAvailableMusic().lobbyMusic[randomIntFromInterval(0, MusicSessionConfiguration.getAvailableMusic().lobbyMusic.length - 1)];
		}
		setLobbySound(songTitle, false);
		lobbySound.setVolume(musicSettings.getLobbyVolume());
		lobbySound.stop();
		if (musicSettings.getLobbyEnabled()) {
			Session.set("lobbySoundIsPlaying", true);
			lobbySound.play();
		}
	} else {
		TimerMap.clickOnNicknameForward.end();
	}
	this.autorun(function () {
		headerLib.titelTracker.depend();
		calculateButtonCount(Session.get("allMembersCount"));
	}.bind(this));
	this.autorun(function () {
		footerElements.removeFooterElements();
		if (localData.containsHashtag(Router.current().params.quizName)) {
			footerElements.addFooterElement((footerElements.footerElemEditQuiz));
			footerElements.addFooterElement(footerElements.footerElemHome);
			if ($(window).outerWidth() >= 1024) {
				footerElements.addFooterElement(footerElements.footerElemQRCode);
			}
			if ($(window).width() > 768) {
				footerElements.addFooterElement(footerElements.footerElemProductTour);
			}
			footerElements.addFooterElement(footerElements.footerElemSound);
			if (Session.get("questionGroup").getQuestionList()[0].typeName() !== "ABCDSurveyQuestion") {
				footerElements.addFooterElement(footerElements.footerElemReadingConfirmation);
			}
			footerElements.addFooterElement(footerElements.footerElemResponseProgress);
			footerElements.addFooterElement(footerElements.footerElemConfidenceSlider);
			footerElements.addFooterElement(footerElements.footerElemNicknames);
			if (navigator.userAgent.match(/iPad/i) == null) {
				footerElements.addFooterElement(footerElements.footerElemFullscreen);
			}
			footerElements.addFooterElement(footerElements.footerElemTheme);
		}
		footerElements.footerTracker.changed();
		memberlistTracker.changed();
		headerLib.calculateHeaderSize();
		headerLib.calculateTitelHeight();
	}.bind(this));
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
	Meteor.defer(function () {
		if (localStorage.getItem("showProductTour") !== "false") {
			getTooltipForRoute();
		}
	});
});
