import { Template } from 'meteor/templating';
import { EventManager } from '/lib/eventmanager.js';
import { mathjaxMarkdown } from '/client/lib/mathjax_markdown.js';
import * as lib from './lib.js';

Template.createQuestionView.events({
    'input #questionText': function () {
        if(!EventManager.findOne()) {
            return;
        }
        lib.addQuestion(EventManager.findOne().questionIndex);
    },
    //Save question in Sessions-Collection when Button "Next" is clicked
    'click #forwardButton': function () {
        if(!EventManager.findOne()) {
            return;
        }
        lib.addQuestion(EventManager.findOne().questionIndex);
        Router.go("/answeroptions");
    },
    "click #backButton": function () {
        Router.go("/");
    },
    "click #formatPreviewButton": function () {
        var formatPreviewText = $('#formatPreviewText');
        if (formatPreviewText.text() === "Format") {
            formatPreviewText.text("Vorschau");
            $('#formatPreviewGlyphicon').removeClass("glyphicon-cog").addClass("glyphicon-phone");
            $('#markdownBarDiv').removeClass('hide');
            $('#questionText').removeClass('round-corners').addClass('round-corners-markdown');
        } else {
            $('.previewSplash').parents('.modal').modal('show');

            mathjaxMarkdown.initializeMarkdownAndLatex();
            var content = $('#questionText').val();

            content = mathjaxMarkdown.getContent(content);

            $("#modalpreview-text").html(content).find('p').css("margin-left", "0px");
        }
    }
});