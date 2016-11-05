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

import {Template} from 'meteor/templating';
import {showFullscreenPicture, closeSplashscreen} from './lib.js';

Template.splashscreen.events({
	"click #btn-hidePreviewModal": function (event) {
		closeSplashscreen(event);
	},
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});

Template.questionAndAnswerSplashscreen.events({
	"click .resizeableImage": function (event) {
		showFullscreenPicture(event);
	},
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});

Template.showHashtagsSplashscreen.events({
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});

Template.errorSplashscreen.events({
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});

Template.deleteConfirmationSplashscreen.events({
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});

Template.resetSessionSplashscreen.events({
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});

Template.exitSessionSplashscreen.events({
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});

Template.renameHashtagSplashscreen.events({
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});

Template.readingConfirmedSplashscreen.events({
	"click .resizeableImage": function (event) {
		showFullscreenPicture(event);
	},
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});

Template.questionPreviewSplashscreen.events({
	"click .resizeableImage": function (event) {
		showFullscreenPicture(event);
	},
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});

Template.kickMemberSplashscreen.events({
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});

Template.connectionQualitySplashscreen.events({
	"click .splashscreen-container-close": function (event) {
		closeSplashscreen(event);
	}
});
