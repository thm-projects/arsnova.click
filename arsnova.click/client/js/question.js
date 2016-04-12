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
    this.autorun(() => {
        this.subscribe('Sessions.question', Session.get("hashtag"), function () {
        var sessionDoc = Sessions.findOne({hashtag: Session.get("hashtag")});
        var content = "";
        console.log(sessionDoc);
        if (sessionDoc) {
            mathjaxMarkdown.initializeMarkdownAndLatex();
            var questionText = sessionDoc.questionText;
            content = mathjaxMarkdown.getContent(questionText);
        }
        console.log(content);
        $('#questionTText').html(content);
        });
    });
});

Template.questionT.onRendered(function () {
    var sessionDoc = Sessions.findOne({hashtag: Session.get("hashtag")});
    var content = "";
    console.log(sessionDoc);
    if (sessionDoc) {
        mathjaxMarkdown.initializeMarkdownAndLatex();
        var questionText = sessionDoc.questionText;
        content = mathjaxMarkdown.getContent(questionText);
    }
    console.log(content);
    $('#questionTText').html(content);
});

Template.questionT.onCreated(function () {
    this.autorun(() => {
        this.subscribe('AnswerOptions.options', Session.get("hashtag"));
    this.subscribe('Sessions.question', Session.get("hashtag"));
});
})
;

Template.questionT.helpers({
    answ: function () {
        const answers = AnswerOptions.find({hashtag: Session.get("hashtag")});
        if (!answers) {
            return "";
        }
        return answers;
    }
});

Template.questionT.events({
    "click #setReadConfirmed": function(event){
        Meteor.call("MemberList.setReadConfirmed",Session.get("hashtag"),Session.get("nick"));
    }
});
