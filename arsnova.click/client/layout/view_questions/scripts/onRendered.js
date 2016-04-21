import * as lib from '././lib.js';

Template.createQuestionView.onRendered(function () {
    lib.calculateWindow();
    $(window).resize(lib.calculateWindow());

    let index;
    lib.subscriptionHandler = Tracker.autorun(()=>{
        if(this.subscriptionsReady()) {
            index = EventManager.findOne().questionIndex;
        }
    });
    var body = $('body');
    body.on('click', '.questionIcon:not(.active)', function () {
        var currentSession = QuestionGroup.findOne();
        if(!currentSession || index >= currentSession.questionList.length) {
            return;
        }

        lib.addQuestion(index);
        Router.go("/question");
    });
    body.on('click', '.removeQuestion', function () {
        index = EventManager.findOne().questionIndex;
    });

    if ($(window).width() >= 992) {
        $('#questionText').focus();
    }
});