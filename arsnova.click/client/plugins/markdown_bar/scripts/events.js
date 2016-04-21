import {markdownAlreadyExistsAndAutoRemove, insertInQuestionText} from './lib.js';

Template.markdownBar.events({
    "click #infoMarkdownButton": function () {
        var markdownInfoText = $("#markdownInfoText");
        markdownInfoText.parents('.modal').modal('show');
        markdownInfoText.html("Sie können Texte innerhalb von ARSnova mithilfe von <a target=\"_blank\" class=\"hyperlink\" href=\"https://de.wikipedia.org/wiki/Markdown\">Markdown</a> auszeichnen. Die am häufigsten verwendeten Markdown Optionen werden in Form von Schaltflächen über den unterstützten Eingabefeldern angeboten. Zudem unterstützt ARSnova <a target=\"_blank\" class=\"hyperlink\" href=\"https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet\">GitHub Flavored Markdown</a>");
    },
    "click #boldMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('**', '**')) {
            insertInQuestionText('**', '**');
        }
    },
    "click #headerMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('###', '###')) {
            if (markdownAlreadyExistsAndAutoRemove('##', '##')) {
                insertInQuestionText('###', '###');
            } else {
                if (markdownAlreadyExistsAndAutoRemove('#', '#')) {
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
        if (!markdownAlreadyExistsAndAutoRemove('- ')) {
            insertInQuestionText('- ');
        }
    },
    "click #sortedListMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('1. ')) {
            insertInQuestionText('1. ');
        }
    },
    "click #latexMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('\\(', '\\)')) {
            if (!markdownAlreadyExistsAndAutoRemove('$$', '$$')) {
                insertInQuestionText('\\(', '\\)');
            }
        } else {
            insertInQuestionText('$$', '$$');
        }
    },
    "click #codeMarkdownButton": function () {
        if (!markdownAlreadyExistsAndAutoRemove('<hlcode>', '</hlcode>')) {
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