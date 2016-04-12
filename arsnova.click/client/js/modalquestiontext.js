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

Template.questionContentSplash.onCreated(function () {
    this.subscribe("EventManager.join",Session.get("hashtag"));
    this.subscribe('QuestionGroup.questionList', Session.get("hashtag"));
});

Template.questionContentSplash.onRendered(function () {
    $('.modal-dialog').width($('#mainContentContainer').width() - 40);
    $(window).resize(function () {
        $('.modal-dialog').width($('#mainContentContainer').width() - 40);
    });
});

Template.questionContentSplash.helpers({
    questionText: function () {
        var questionDoc = QuestionGroup.findOne();
        if (questionDoc) {
            return questionDoc.questionList[EventManager.findOne().questionIndex].questionText;
        }
        else {
            return "";
        }
    }
});