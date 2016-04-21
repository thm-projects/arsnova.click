export let countdown = null;
export let routeToLeaderboardTimer = null;
export let eventManagerObserver = null;
export let readingConfirmationTracker = null;

export function deleteCountdown () {
    countdown = null;
}

export function setEventManagerObserver (observer) {
    eventManagerObserver = observer;
}

/**
 * @source http://stackoverflow.com/a/17267684
 */
export function hsl_col_perc (percent, start, end) {
    var a = percent / 100, b = end * a, c = b + start;
    return 'hsl(' + c + ',50%,25%)';
}

export function getPercentRead (index) {
    var sumRead = 0;
    var count = 0;
    MemberList.find().map(function (member) {
        count++;
        if (member.readConfirmed[index]) {
            sumRead += member.readConfirmed[index];
        }
    });
    return count ? Math.floor(sumRead / count * 100) : 0;
}

export function getCurrentRead (index) {
    var sumRead = 0;
    MemberList.find().map(function (member) {
        if (member.readConfirmed[index]) {
            sumRead += member.readConfirmed[index];
        }
    });
    return sumRead;
}

export function checkIfIsCorrect (isCorrect) {
    return isCorrect > 0 ? 'progress-success' : isCorrect < 0 ? 'progress-default' : 'progress-failure';
}

export function startCountdown (index) {
    Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), index);
    var questionDoc = QuestionGroup.findOne().questionList[index];
    Session.set("sessionCountDown", questionDoc.timer);
    $("#countdowndiv").appendTo($("body"));
    $("#countdown").appendTo($("body"));
    var f = new buzz.sound('/sounds/trillerpfeife.mp3', {
        volume: 50
    });
    countdown = new ReactiveCountdown(questionDoc.timer / 1000, {

        tick: function () {
            if (countdown.get() < 6) {
                var image = document.getElementById('countdown');
                var image1 = $('.fader');
                var imageDiv = document.getElementById('countdowndiv');

                if (image.src.match("gr5")) {
                    image.src = "/images/gruen.gif";
                    image1.fadeIn(500);
                    imageDiv.style.display = "block";
                    image.style.display = "block";
                    image1.fadeOut(500);
                } else if (image.src.match("gruen")) {
                    imageDiv.style.backgroundColor = "#2f4f4f";
                    image.src = "/images/blau.gif";
                    image1.fadeIn(500);
                    image1.fadeOut(500);
                } else if (image.src.match("blau")) {
                    imageDiv.style.backgroundColor = "#663399";
                    image.src = "/images/lila3.gif";
                    image1.fadeIn(500);
                    image1.fadeOut(500);
                } else if (image.src.match("lila3")) {
                    imageDiv.style.backgroundColor = "#b22222";
                    image.src = "/images/rot2.gif";
                    image1.fadeIn(500);
                    image1.fadeOut(500);
                } else if (image.src.match("rot2")) {
                    imageDiv.style.backgroundColor = "#ff8c00";
                    image.src = "/images/orange1.gif";
                    image1.fadeIn(500);
                    image1.fadeOut(500);
                } else if (image.src.match("orange1")) {
                    imageDiv.style.backgroundColor = "#ffd700";
                    image.src = "/images/gelb0.gif";
                    image1.fadeIn(500);
                    image1.fadeOut(500);
                    if (Session.get("togglemusic")) {
                        f.play();
                    }
                }

            }
        }
    });

    buzzsound1.setVolume(Session.get("globalVolume"));
    if (Session.get("togglemusic")) {
        buzzsound1.play();
    }

    countdown.start(function () {
        buzzsound1.stop();
        Session.set("countdownInitialized", false);
        $('.disableOnActiveCountdown').removeAttr("disabled");
        if (index + 1 >= QuestionGroup.findOne().questionList.length) {
            Session.set("sessionClosed", true);
            if (Session.get("isOwner") && AnswerOptions.find({isCorrect: 1}).count() > 0) {
                routeToLeaderboardTimer = setTimeout(() => {
                    Router.go("/statistics");
                }, 7000);
            }
        }
    });
    Session.set("countdownInitialized", true);
    $('.disableOnActiveCountdown').attr("disabled", "disabled");
}

export function setMcCSSClasses () {
    var windowWidth = $(window).width();

    for (var i = 0; i < 2; i++) {
        var label = $("#mc_label" + i);
        var bar = $("#mc_bar" + i);
        label.removeClass();
        bar.removeClass();
        if (windowWidth < 361) {
            label.addClass("col-xs-6 col-sm-6 col-md-6");
            bar.addClass("col-xs-6 col-sm-6 col-md-6");
        }
        if (windowWidth > 360 && windowWidth < 431) {
            label.addClass("col-xs-5 col-sm-5 col-md-5");
            bar.addClass("col-xs-7 col-sm-7 col-md-7");
        }
        if (windowWidth > 430 && windowWidth < 576) {
            label.addClass("col-xs-4 col-sm-4 col-md-4");
            bar.addClass("col-xs-8 col-sm-8 col-md-8");
        }
        if (windowWidth > 575 && windowWidth < 851) {
            label.addClass("col-xs-3 col-sm-3 col-md-3");
            bar.addClass("col-xs-9 col-sm-9 col-md-9");
        }
        if (windowWidth > 850 && windowWidth < 992) {
            label.addClass("col-xs-2 col-sm-2 col-md-2");
            bar.addClass("col-xs-10 col-sm-10 col-md-10");
        }
        if (windowWidth > 991 && windowWidth < 1151) {
            label.addClass("col-xs-4 col-sm-4 col-md-4");
            bar.addClass("col-xs-8 col-sm-8 col-md-8");
        }
        if (windowWidth > 1150 && windowWidth < 1701) {
            label.addClass("col-xs-3 col-sm-3 col-md-3");
            bar.addClass("col-xs-9 col-sm-9 col-md-9");
        }
        if (windowWidth > 1700) {
            label.addClass("col-xs-2 col-sm-2 col-md-2");
            bar.addClass("col-xs-10 col-sm-10 col-md-10");
        }
    }
}

export function startReadingConfirmationTracker () {
    readingConfirmationTracker = Tracker.autorun(()=> {
        if (EventManager.findOne()) {
            EventManager.find().observeChanges({
                changed: function (id, changedFields) {
                    if (!isNaN(changedFields.readingConfirmationIndex)) {
                        $('.splash-screen-show-readingConfirmation').parents('.modal').modal();
                        var questionDoc = QuestionGroup.findOne();
                        var content = "";
                        if (questionDoc) {
                            mathjaxMarkdown.initializeMarkdownAndLatex();
                            var questionText = questionDoc.questionList[EventManager.findOne().readingConfirmationIndex].questionText;
                            content = mathjaxMarkdown.getContent(questionText);
                        }

                        $('#questionTText').html(content);
                    }

                    if (Session.get("isOwner")) {
                        $('#setReadConfirmed').text("Fenster schließen").parent().on('click', '#setReadConfirmed', function (event) {
                            event.stopPropagation();
                            closeSplashscreen();
                        });
                    }
                }
            });
        }
    });
}

/**
 * TODO remove this function with the Meteor 1.3 update and replace with an import from the memberList!
 */
export function calculateButtonCount () {

    /*
     This session variable determines if the user has clicked on the show-more-button. The button count must not
     be calculated then. It is set in the event handler of the button and is reset if the user reenters the page
     */
    if (Session.get("LearnerCountOverride")) {
        return;
    }

    /*
     To calculate the maximum output of attendee button rows we need to:
     - get the contentPosition height (the content wrapper for all elements)
     - subtract the confirmationCounter height (the progress bar)
     - subtract the attendee-in-quiz-wrapper height (the session information for the attendees)
     - subtract the margin to the top (the title or the show more button)
     */
    var viewport = $(".contentPosition"), learnerListMargin = $('.learner-list').length > 0 ? parseInt($('.learner-list').first().css('margin-top').replace("px", "")) : 0;

    var viewPortHeight = viewport.outerHeight() - $('.question-title').outerHeight(true) - $('.readingConfirmationProgressRow').outerHeight(true) - $('.btn-more-learners').outerHeight(true) - learnerListMargin;

    /* The height of the learner button must be set manually if the html elements are not yet generated */
    var btnLearnerHeight = $('.btn-learner').first().parent().outerHeight() ? $('.btn-learner').first().parent().outerHeight() : 54;

    /* Calculate how much buttons we can place in the viewport until we need to scroll */
    var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);

    /*
     Multiply the displayed elements by 3 if on widescreen and reduce the max output of buttons by 1 row for the display
     more button if necessary. Also make sure there is at least one row of buttons shown even if the user has to scroll
     */
    var allMembers = [];
    MemberList.find().forEach(function (doc) {
        if (doc.readConfirmed[EventManager.findOne().readingConfirmationIndex]) {
            allMembers.push(doc);
        }
    });
    var limitModifier = (viewport.outerWidth() >= 992) ? 3 : (viewport.outerWidth() >= 768 && viewport.outerWidth() < 992) ? 2 : 1;

    queryLimiter *= limitModifier;
    if (queryLimiter <= 0) {
        queryLimiter = limitModifier;
    } else if (allMembers > queryLimiter) {

        /*
         Use Math.ceil() as a session owner because the member buttons position may conflict with the back/forward buttons position.
         As a session attendee we do not have these buttons, so we can use Math.floor() to display a extra row
         */
        if ($(".fixed-bottom").length > 0) {
            queryLimiter -= Math.ceil($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
        } else {
            queryLimiter -= Math.floor($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
        }
    }

    /*
     This session variable holds the amount of shown buttons and is used in the scripts function
     Template.memberlist.scripts.learners which gets the attendees from the mongo db
     */
    Session.set("LearnerCount", queryLimiter);
}