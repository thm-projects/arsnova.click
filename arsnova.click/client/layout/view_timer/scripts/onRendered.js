import * as lib from './lib.js';

Template.createTimerView.onRendered(function () {
    lib.createSlider();

    let index;
    lib.subscriptionHandler = Tracker.autorun(()=> {
        if (this.subscriptionsReady()) {
            index = EventManager.findOne().questionIndex;
            lib.subscriptionHandler.stop();
            lib.setSlider(index);
        }
    });
    var body = $('body');
    body.on('click', '.questionIcon:not(.active)', function () {
        var currentSession = QuestionGroup.findOne();
        if (!currentSession || index >= currentSession.questionList.length) {
            return;
        }

        lib.setTimer(index);
        Router.go("/question");
    });
    body.on('click', '.removeQuestion', function () {
        index = EventManager.findOne().questionIndex;
    });

    lib.validationTrackerHandle = Tracker.autorun(()=> {
        var valid_questions = Session.get("valid_questions");
        var forwardButton = $('#forwardButton');
        forwardButton.removeAttr("disabled");
        for (var i = 0; i < valid_questions.length; i++) {
            if (!valid_questions[i]) {
                forwardButton.attr("disabled", "disabled");
            }
        }
    });
});