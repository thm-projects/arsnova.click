Template.questionList.onCreated(function () {
    if(!Session.get("questionIndex")) Session.set("questionIndex", 0);
    this.subscribe('QuestionGroup.questionList', Session.get("hashtag"));
});

Template.questionList.onDestroyed(function () {
    
});

Template.questionList.onRendered(function () {
    
});

Template.questionList.helpers({
    question: function () {
        //var doc = QuestionGroup.findOne();
        return Session.get("currentQuestionGroup").questionList;
    },
    getNormalizedIndex: function (index) {
        return index + 1;
    },
    isActiveIndex: function (index) {
        return index === Session.get("questionIndex");
    }
});

Template.questionList.events({
    'click .questionIcon': function (event) {
        Session.set("questionIndex",parseInt($(event.target).closest(".questionIcon").attr("id").replace("questionIcon_","")));
    },
    'click .removeQuestion': function (event) {
        var id = parseInt($(event.target).closest(".questionIcon").attr("id").replace("questionIcon_",""));
        Meteor.call("QuestionGroup.removeQuestion", {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionIndex: id
        }, (err, res) => {
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
            } else {
                localData.removeQuestion(Session.get("hashtag"), id);
                if(QuestionGroup.findOne().questionList.length===0) {
                    addQuestion();
                }
                if(id === 0) {
                    Session.set("questionIndex",0);
                } else {
                    Session.set("questionIndex",(id - 1));
                }
            }
        });
        setScrollingPosition();
    },
    'click #addQuestion': function (event) {
        addQuestion();
        setScrollingPosition();
    }
});

function setScrollingPosition() {
    $(".questionScrollPane").scrollTo('.active');
}

/**
 * @source http://lions-mark.com/jquery/scrollTo/
 */
$.fn.scrollTo = function( target, options, callback ){
    if(typeof options == 'function' && arguments.length == 2){ callback = options; options = target; }
    var settings = $.extend({
        scrollTarget  : target,
        offsetTop     : 50,
        duration      : 500,
        easing        : 'swing'
    }, options);
    return this.each(function(){
        var scrollPane = $(this);
        var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
        var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
        scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
            if (typeof callback == 'function') { callback.call(this); }
        });
    });
};

function addQuestion(){
    Meteor.call("QuestionGroup.addQuestion", {
        privateKey: localData.getPrivateKey(),
        hashtag: Session.get("hashtag"),
        questionIndex: Session.get("currentQuestionGroup").questionList.length,
        questionText: "Dies ist die " + Session.get("currentQuestionGroup").questionList.length + ". Frage"
    }, (err, res) => {
        if (err) {
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html(err.reason);
        } else {
            localData.addQuestion(Session.get("hashtag"), Session.get("currentQuestionGroup").questionList.length, "");
        }
    });
}