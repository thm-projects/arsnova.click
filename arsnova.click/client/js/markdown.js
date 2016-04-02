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

Template.markdownBar.events({
    "click #infoMarkdownButton": function (event) {
        // TODO not implemented yet
    },
    "click #boldMarkdownButton": function (event) {
        insertInQuestionText('**', '**');
    },
    "click #headerMarkdownButton": function (event) {
        insertInQuestionText('#', '#');
    },
    "click #linkMarkdownButton": function (event) {
        // TODO not implemented yet
    },
    "click #unsortedListMarkdownButton": function (event) {
        insertInQuestionText('- ', '');
    },
    "click #sortedListMarkdownButton": function (event) {
        insertInQuestionText('1. ', '');
    },
    "click #latexMarkdownButton": function (event) {
        insertInQuestionText('\\)', '\\)');
    },
    "click #codeMarkdownButton": function (event) {
        insertInQuestionText('<hlcode>', '</hlcode>');
    },
    "click #commentMarkdownButton": function (event) {
        insertInQuestionText('>', '');
    },
    "click #pictureMarkdownButton": function (event) {
        // TODO not implemented yet
    },
    "click #youtubeMarkdownButton": function (event) {
        // TODO not implemented yet
    },
    "click #vimeoMarkdownButton": function (event) {
        // TODO not implemented yet
    },
});

function insertInQuestionText(textStart, textEnd) {
    var textarea = document.getElementById('questionText');

    var scrollPos = textarea.scrollTop;

    var strPosBegin = textarea.selectionStart;
    var strPosEnd = textarea.selectionEnd;

    var frontText = (textarea.value).substring(0,strPosBegin);
    var backText = (textarea.value).substring(strPosEnd,textarea.value.length);
    var selectedText = (textarea.value).substring(strPosBegin, strPosEnd);

    textarea.value = frontText + textStart + selectedText + textEnd + backText;

    textarea.selectionStart = strPosBegin + textStart.length;
    textarea.selectionEnd = strPosEnd + textStart.length;
    textarea.focus();

    textarea.scrollTop = scrollPos;
}