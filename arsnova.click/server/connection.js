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
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {MemberListCollection} from '/lib/member_list/collection.js';
import {ResponsesCollection} from '/lib/responses/collection.js';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';

Meteor.setInterval(function () {
	const sessionDeleteAfterIdleMinutes = 10; //Minutes to session is idle
	const now = (new Date()).getTime();
	const sessionDeleteTimeInMilliseconds = (sessionDeleteAfterIdleMinutes * 60 * 1000);
	EventManagerCollection.find({
		lastConnection: {$lt: (now - sessionDeleteTimeInMilliseconds)},
		sessionStatus: {$ne: 0}
	}).forEach(function (session) {
		//Remove Session-Data
		AnswerOptionCollection.remove({hashtag: session.hashtag});
		MemberListCollection.remove({hashtag: session.hashtag});
		ResponsesCollection.remove({hashtag: session.hashtag});
		QuestionGroupCollection.remove({hashtag: session.hashtag});
		EventManagerCollection.remove({hashtag: session.hashtag});
		SessionConfigurationCollection.remove({hashtag: session.hashtag});
	});
}, 300000);
