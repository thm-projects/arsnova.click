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

Template.markdownBar.onRendered(function () {
    $('#infoMarkdownButton').tooltip();
    $('#boldMarkdownButton').tooltip();
    $('#headerMarkdownButton').tooltip();
    $('#linkMarkdownButton').tooltip();
    $('#unsortedListMarkdownButton').tooltip();
    $('#sortedListMarkdownButton').tooltip();
    $('#latexMarkdownButton').tooltip();
    $('#codeMarkdownButton').tooltip();
    $('#commentMarkdownButton').tooltip();
    $('#pictureMarkdownButton').tooltip();
    $('#youtubeMarkdownButton').tooltip();
    $('#vimeoMarkdownButton').tooltip();
});

Template.markdownBar.events({
    "click #infoMarkdownButton": function (event) {
        var markdownInfoText = $("#markdownInfoText");
        markdownInfoText.parents('.modal').modal('show');
        markdownInfoText.html("Sie können Texte innerhalb von ARSnova mithilfe von <a class=\"hyperlink\" href=\"https://de.wikipedia.org/wiki/Markdown\">Markdown</a> auszeichnen. Die am häufigsten verwendeten Markdown Optionen werden in Form von Schaltflächen über den unterstützten Eingabefeldern angeboten. Zudem unterstützt ARSnova <a class=\"hyperlink\" href=\"https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet\">GitHub Flavored Markdown</a>");
    },
    "click #boldMarkdownButton": function (event) {
        if (!markdownAlreadyExistsAndAutoRemove('**', '**')){
            insertInQuestionText('**', '**');
        }
    },
    "click #headerMarkdownButton": function (event) {
        insertInQuestionText('#', '#');
    },
    "click #linkMarkdownButton": function (event) {
        $("#hyperlinkInsertSplashContent").parents('.modal').modal('show');
    },
    "click #unsortedListMarkdownButton": function (event) {
        if (!markdownAlreadyExistsAndAutoRemove('- ')){
            insertInQuestionText('- ');
        }
    },
    "click #sortedListMarkdownButton": function (event) {
        if (!markdownAlreadyExistsAndAutoRemove('1. ')){
            insertInQuestionText('1. ');
        }
    },
    "click #latexMarkdownButton": function (event) {
        if (!markdownAlreadyExistsAndAutoRemove('\\(', '\\)')){
            if (!markdownAlreadyExistsAndAutoRemove('$$', '$$')) {
                insertInQuestionText('\\(', '\\)');
            }
        } else {
            insertInQuestionText('$$', '$$');
        }
    },
    "click #codeMarkdownButton": function (event) {
        if (!markdownAlreadyExistsAndAutoRemove('<hlcode>', '</hlcode>')){
            insertInQuestionText('<hlcode>', '</hlcode>');
        }
    },
    "click #commentMarkdownButton": function (event) {
        if (!markdownAlreadyExistsAndAutoRemove('>')) {
            insertInQuestionText('>');
        }
    },
    "click #pictureMarkdownButton": function (event) {
        $("#pictureInsertSplashContent").parents('.modal').modal('show');
    },
    "click #youtubeMarkdownButton": function (event) {
        $("#youtubeInsertSplashContent").parents('.modal').modal('show');
    },
    "click #vimeoMarkdownButton": function (event) {
        $("#vimeoInsertSplashContent").parents('.modal').modal('show');
    },
});

Template.hyperlinkInsertSplash.events({
    "click #js-btn-saveHyperlink": function (event) {
        var linkText = document.getElementById('hyperlinkText').value;
        var linkDestination = document.getElementById('hyperlinkDestination').value;
        insertInQuestionText('[' + linkText + '](' + linkDestination + ')');
        closeSplashscreen();
    }
});

Template.pictureInsertSplash.events({
    "click #js-btn-savePicture": function (event) {
        var linkText = document.getElementById('pictureText').value;
        var linkDestination = document.getElementById('pictureDestination').value;
        insertInQuestionText('![' + linkText + '](' + linkDestination + ' "autoxautoxleft")');
        closeSplashscreen();
    }
});

Template.youtubeInsertSplash.events({
    "click #js-btn-saveYoutube": function (event) {
        var linkText = document.getElementById('youtubeText').value;
        var linkDestination = document.getElementById('youtubeDestination').value;
        var picUrl = linkDestination.replace("www.", "img.").replace("watch?v=", "vi/").concat("/o.jpg");
        insertInQuestionText('[![' + linkText + '](' + picUrl + ')](' + linkDestination + ')');
        closeSplashscreen();
    }
});

Template.vimeoInsertSplash.events({
    "click #js-btn-saveVimeo": function (event) {
        var linkText = document.getElementById('vimeoText').value;
        var linkDestination = document.getElementById('vimeoDestination').value;
        var videoId = linkDestination.substr(linkDestination.lastIndexOf("/") + 1);
        var picUrl = 'https://i.vimeocdn.com/video/' + videoId + '_200x150.jpg';
        var videoUrl = 'https://player.vimeo.com/video/' + videoId;
        insertInQuestionText('[![' + linkText + '](' + picUrl + ')](' + videoUrl + ')');
        closeSplashscreen();
    }
});

function insertInQuestionText (textStart, textEnd) {
    textEnd = typeof textEnd !== 'undefined' ? textEnd : '';
    var textarea = document.getElementById('questionText');

    var scrollPos = textarea.scrollTop;

    var strPosBegin = textarea.selectionStart;
    var strPosEnd = textarea.selectionEnd;

    var frontText = (textarea.value).substring(0, strPosBegin);
    var backText = (textarea.value).substring(strPosEnd, textarea.value.length);
    var selectedText = (textarea.value).substring(strPosBegin, strPosEnd);

    textarea.value = frontText + textStart + selectedText + textEnd + backText;

    textarea.selectionStart = strPosBegin + textStart.length;
    textarea.selectionEnd = strPosEnd + textStart.length;
    textarea.focus();

    textarea.scrollTop = scrollPos;
}

function markdownAlreadyExistsAndAutoRemove (textStart, textEnd) {
    var textarea = document.getElementById('questionText');
    var scrollPos = textarea.scrollTop;
    var strPosBegin = textarea.selectionStart;
    var strPosEnd = textarea.selectionEnd;

    if (strPosBegin == strPosEnd) {
        textEnd = typeof textEnd !== 'undefined' ? textEnd : '';
        var textEndExists = false;
        var textStartExists = false;

        if (textEnd.length > 0) {
            if ((textarea.value).substring(strPosBegin, strPosBegin + textEnd.length) == textEnd) {
                textEndExists = true;
            }
        } else {
            textEndExists = true;
        }

        if ((textarea.value).substring(strPosBegin - textStart.length, strPosBegin) == textStart) {
            textStartExists = true;
        }
        
        if (textStartExists && textEndExists) {
            var frontText = (textarea.value).substring(0, strPosBegin - textStart.length);
            var backText = (textarea.value).substring(strPosBegin + textEnd.length, textarea.value.length);
            textarea.value = frontText + backText;
            textarea.selectionStart = strPosBegin - textStart.length;
            textarea.selectionEnd = strPosBegin - textStart.length;
            textarea.focus();

            textarea.scrollTop = scrollPos;

            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}