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
import {ResponsesCollection} from '/lib/responses/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import * as localData from '/lib/local_storage.js';
import {deleteCountdown, startCountdown} from './lib.js';

Template.liveResults.onCreated(function () {
	deleteCountdown();
	if (!localData.containsHashtag(Router.current().params.quizName)) {
		let allMemberResponses = ResponsesCollection.find({questionIndex: EventManagerCollection.findOne().questionIndex}).fetch();
		let memberWithGivenResponsesAmount = _.uniq(allMemberResponses, false, function (user) {
			return user.userNick;
		}).length;
		let memberAmount = MemberListCollection.find().fetch().length;
		if (memberWithGivenResponsesAmount !== memberAmount) {
			startCountdown(EventManagerCollection.findOne().questionIndex);
		}
	}
});
