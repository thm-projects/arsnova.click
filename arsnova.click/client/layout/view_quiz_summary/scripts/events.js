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

Template.quizSummary.events({
	"click #forwardButton": function () {
		Meteor.call("MemberListCollection.removeFromSession", Router.current().params.quizName);
		Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, 0);
		Meteor.call("EventManagerCollection.setSessionStatus", Router.current().params.quizName, 2);
		Meteor.call("HashtagsCollection.setDefaultTheme", Router.current().params.quizName, localStorage.getItem("theme"));
		Meteor.call("HashtagsCollection.setSelectedNicks", Router.current().params.quizName, Session.get("questionGroup").getConfiguration().getNickSettings().getSelectedValues());
		Meteor.call("QuestionGroupCollection.persist", Session.get("questionGroup").serialize());
		Router.go("/" + Router.current().params.quizName + "/memberlist");
	},
	"click #backButton": function () {
		let firstFailedIndex = null;
		Session.get("questionGroup").getQuestionList().forEach(function (questionItem) {
			if (!firstFailedIndex && !questionItem.isValid()) {
				firstFailedIndex = questionItem.getQuestionIndex();
			}
		});
		if (firstFailedIndex) {
			Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, firstFailedIndex);
			Router.go("/" + Router.current().params.quizName + "/question");
		} else {
			Router.go("/" + Router.current().params.quizName + "/settimer");
		}
	},
	"click #showSelectedNicks": function () {
		if (Session.get("showSelectedNicks") === true) {
			Session.set("showSelectedNicks", false);
		} else {
			Session.set("showSelectedNicks", true);
		}
	}
});
