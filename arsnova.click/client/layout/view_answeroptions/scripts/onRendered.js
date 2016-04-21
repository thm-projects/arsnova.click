import * as lib from '././lib.js';

Template.createAnswerOptions.onRendered(function () {
    var calculateHeight = function calculateHeight() {
        var answer_options_height = $(".container").height() - $(".row-landingpage-buttons").outerHeight(true) - $(".titel-relative").outerHeight(true);
        $('.answer-options').css("height", answer_options_height);
    };
    $(window).resize(calculateHeight);
    calculateHeight();

    let index;
    lib.subscriptionHandler = Tracker.autorun(()=> {
        if (this.subscriptionsReady()) {
            index = EventManager.findOne().questionIndex;
        }
    });
    var body = $('body');
    body.on('click', '.questionIcon:not(.active)', function () {
        var currentSession = QuestionGroup.findOne();
        if (!currentSession || index >= currentSession.questionList.length) {
            return;
        }

        lib.parseAnswerOptionInput(index);
        Router.go("/question");
    });
    body.on('click', '.removeQuestion', function () {
        index = EventManager.findOne().questionIndex;
    });

    if ($(window).width() >= 992) {
        $('#answerOptionText_Number0').focus();
    }
});