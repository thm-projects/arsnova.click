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
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {SessionConfigurationCollection} from '/lib/session_configuration/collection.js';
import {DefaultQuestionGroup} from "/lib/questions/questiongroup_default.js";
import {SessionConfiguration} from "/lib/session_configuration/session_config.js";

Template.liveResults.onCreated(function () {
	const questionGroup = new DefaultQuestionGroup(QuestionGroupCollection.findOne());
	questionGroup.setConfiguration(new SessionConfiguration(SessionConfigurationCollection.findOne()));
	Session.set("questionGroup",questionGroup);
});
