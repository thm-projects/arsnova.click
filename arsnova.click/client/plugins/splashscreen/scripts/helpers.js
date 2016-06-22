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
import {hashtagSchema} from '/lib/hashtags/collection.js';
import * as localData from '/lib/local_storage.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {isMobileDevice} from './lib.js';

Template.splashscreen.helpers($.extend(isMobileDevice, {

}));

Template.kickMemberSplashscreen.helpers($.extend(isMobileDevice, {

}));

Template.deleteConfirmationSplashscreen.helpers($.extend(isMobileDevice, {

}));

Template.resetSessionSplashscreen.helpers($.extend(isMobileDevice, {
	isSessionRunning: function () {
		return MemberListCollection.find().count() !== 0;
	}
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

Template.questionPreviewSplashscreen.helpers($.extend(isMobileDevice, {

}));

Template.readingConfirmedSplashscreen.helpers($.extend(isMobileDevice, {

}));

Template.questionAndAnswerSplashscreen.helpers($.extend(isMobileDevice, {

}));

Template.renameHashtagSplashscreen.helpers($.extend(isMobileDevice, {getHashtagSchema: hashtagSchema}, {

}));
