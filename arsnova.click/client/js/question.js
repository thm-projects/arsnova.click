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
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.
 */

Template.questionT.onCreated(function () {
    this.subscribe("EventManager.join",Session.get("hashtag"));
    this.subscribe('AnswerOptions.options', Session.get("hashtag"));
    this.subscribe('QuestionGroup.questionList', Session.get("hashtag"));
    this.subscribe('MemberList.members', Session.get("hashtag"));
});

Template.questionT.onRendered(function () {
    
});

Template.questionT.helpers({
    answ: function () {
        const answers = AnswerOptions.find({questionIndex: EventManager.findOne().readingConfirmationIndex});
        return answers ? answers : "";
    }
});

Template.questionT.events({
    "click #setReadConfirmed": function(event){
        Meteor.call("MemberList.setReadConfirmed", {
            hashtag: Session.get("hashtag"),
            questionIndex: EventManager.findOne().readingConfirmationIndex,
            nick: Session.get("nick")
        }, (err, res)=> {
            if(err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
            } else {
                closeSplashscreen();
            }
        });
    }
});
