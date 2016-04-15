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
    "click #infoMarkdownButton": function () {
        var markdownInfoText = $("#markdownInfoText");
        markdownInfoText.parents('.modal').modal('show');
        markdownInfoText.html("Sie können Texte innerhalb von ARSnova mithilfe von <a target=\"_blank\" class=\"hyperlink\" href=\"https://de.wikipedia.org/wiki/Markdown\">Markdown</a> auszeichnen. Die am häufigsten verwendeten Markdown Optionen werden in Form von Schaltflächen über den unterstützten Eingabefeldern angeboten. Zudem unterstützt ARSnova <a target=\"_blank\" class=\"hyperlink\" href=\"https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet\">GitHub Flavored Markdown</a>");
    },
    "click #boldMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('**', '**')){
            insertInQuestionText('**', '**');
        }
    },
    "click #headerMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('###', '###')){
            if (markdownAlreadyExistsAndAutoRemove('##', '##')){
                insertInQuestionText('###', '###');
            } else {
                if (markdownAlreadyExistsAndAutoRemove('#', '#')){
                    insertInQuestionText('##', '##');
                } else {
                    insertInQuestionText('#', '#');
                }
            }
        }
    },
    "click #linkMarkdownButton": function () {
        $("#hyperlinkInsertSplashContent").parents('.modal').modal('show');

        var textarea = document.getElementById('questionText');
        if (textarea.selectionStart != textarea.selectionEnd) {
            var strPosBegin = textarea.selectionStart;
            var strPosEnd = textarea.selectionEnd;
            var frontText = (textarea.value).substring(0, strPosBegin);
            var middleText = (textarea.value).substring(strPosBegin, strPosEnd);
            var backText = (textarea.value).substring(strPosEnd, textarea.value.length);

            $('#hyperlinkText').val(middleText);
            textarea.value = frontText + backText;
        }
    },
    "click #unsortedListMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('- ')){
            insertInQuestionText('- ');
        }
    },
    "click #sortedListMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('1. ')){
            insertInQuestionText('1. ');
        }
    },
    "click #latexMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('\\(', '\\)')){
            if (!markdownAlreadyExistsAndAutoRemove('$$', '$$')) {
                insertInQuestionText('\\(', '\\)');
            }
        } else {
            insertInQuestionText('$$', '$$');
        }
    },
    "click #codeMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('<hlcode>', '</hlcode>')){
            insertInQuestionText('<hlcode>', '</hlcode>');
        }
    },
    "click #commentMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('>')) {
            insertInQuestionText('>');
        }
    },
    "click #pictureMarkdownButton": function () {
        $("#pictureInsertSplashContent").parents('.modal').modal('show');

        var textarea = document.getElementById('questionText');
        if (textarea.selectionStart != textarea.selectionEnd) {
            var strPosBegin = textarea.selectionStart;
            var strPosEnd = textarea.selectionEnd;
            var frontText = (textarea.value).substring(0, strPosBegin);
            var middleText = (textarea.value).substring(strPosBegin, strPosEnd);
            var backText = (textarea.value).substring(strPosEnd, textarea.value.length);

            $('#hyperlinkText').val(middleText);
            textarea.value = frontText + backText;
        }
    },
    "click #youtubeMarkdownButton": function () {
        $("#youtubeInsertSplashContent").parents('.modal').modal('show');

        var textarea = document.getElementById('questionText');
        if (textarea.selectionStart != textarea.selectionEnd) {
            var strPosBegin = textarea.selectionStart;
            var strPosEnd = textarea.selectionEnd;
            var frontText = (textarea.value).substring(0, strPosBegin);
            var middleText = (textarea.value).substring(strPosBegin, strPosEnd);
            var backText = (textarea.value).substring(strPosEnd, textarea.value.length);

            $('#youtubeText').val(middleText);
            textarea.value = frontText + backText;
        }
    },
    "click #vimeoMarkdownButton": function () {
        $("#vimeoInsertSplashContent").parents('.modal').modal('show');

        var textarea = document.getElementById('questionText');
        if (textarea.selectionStart != textarea.selectionEnd) {
            var strPosBegin = textarea.selectionStart;
            var strPosEnd = textarea.selectionEnd;
            var frontText = (textarea.value).substring(0, strPosBegin);
            var middleText = (textarea.value).substring(strPosBegin, strPosEnd);
            var backText = (textarea.value).substring(strPosEnd, textarea.value.length);

            $('#vimeoText').val(middleText);
            textarea.value = frontText + backText;
        }
    }
});

Template.hyperlinkInsertSplash.events({
    "click #js-btn-saveHyperlink": function () {
        var linkText = document.getElementById('hyperlinkText').value;
        var linkDestination = document.getElementById('hyperlinkDestination').value;
        insertInQuestionText('[' + linkText + '](' + linkDestination + ')');
        $('#hyperlinkText').val("");
        $('#hyperlinkDestination').val("");
        closeSplashscreen();
    },
    "click #js-btn-closeHyperlink": function () {
        $('#hyperlinkText').val("");
        $('#hyperlinkDestination').val("");
        closeSplashscreen();
    }
});

Template.pictureInsertSplash.events({
    "click #js-btn-savePicture": function () {
        var linkText = document.getElementById('pictureText').value;
        var linkDestination = document.getElementById('pictureDestination').value;
        insertInQuestionText('![' + linkText + '](' + linkDestination + ' "autoxautoxleft")');
        $('#pictureText').val("");
        $('#pictureDestination').val("");
        closeSplashscreen();
    },
    "click #js-btn-closePicture": function () {
        $('#pictureText').val("");
        $('#pictureDestination').val("");
        closeSplashscreen();
    }
});

Template.youtubeInsertSplash.events({
    "click #js-btn-saveYoutube": function () {
        var linkText = document.getElementById('youtubeText').value;
        var linkDestination = document.getElementById('youtubeDestination').value;
        var picUrl = linkDestination.replace("www.", "img.").replace("watch?v=", "vi/").concat("/0.jpg");
        insertInQuestionText('[![' + linkText + '](' + picUrl + ')](' + linkDestination + ')');
        $('#youtubeText').val("");
        $('#youtubeDestination').val("");
        closeSplashscreen();
    },
    "click #js-btn-closeYoutube": function () {
        $('#youtubeText').val("");
        $('#youtubeDestination').val("");
        closeSplashscreen();
    }
});

Template.vimeoInsertSplash.events({
    "click #js-btn-saveVimeo": function () {
        var linkText = document.getElementById('vimeoText').value;
        var linkDestination = document.getElementById('vimeoDestination').value;
        var videoId = linkDestination.substr(linkDestination.lastIndexOf("/") + 1);
        var picUrl = 'https://i.vimeocdn.com/video/' + videoId + '_200x150.jpg';
        var videoUrl = 'https://player.vimeo.com/video/' + videoId;
        insertInQuestionText('[![' + linkText + '](' + picUrl + ')](' + videoUrl + ')');
        $('#vimeoText').val("");
        $('#vimeoDestination').val("");
        closeSplashscreen();
    },
    "click #js-btn-closeVimeo": function () {
        $('#vimeoText').val("");
        $('#vimeoDestination').val("");
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

    textEnd = typeof textEnd !== 'undefined' ? textEnd : '';
    var textEndExists = false;
    var textStartExists = false;

    if (textEnd.length > 0) {
        if ((textarea.value).substring(strPosEnd, strPosEnd + textEnd.length) == textEnd) {
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
        var middleText = (textarea.value).substring(strPosBegin, strPosEnd);
        var backText = (textarea.value).substring(strPosEnd + textEnd.length, textarea.value.length);
        textarea.value = frontText + middleText + backText;
        textarea.selectionStart = strPosBegin - textStart.length;
        textarea.selectionEnd = strPosEnd - (textEnd.length === 0 ? textStart.length : textEnd.length);
        textarea.focus();

        textarea.scrollTop = scrollPos;

        return true;
    } else {
        return false;
    }
}