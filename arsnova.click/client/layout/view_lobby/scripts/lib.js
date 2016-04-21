export let memberlistObserver = null;

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
    var viewport = $(".contentPosition"), attendeeInQuiz = $('#attendee-in-quiz-wrapper').length > 0 ? $('#attendee-in-quiz-wrapper').outerHeight() : 0, learnerListMargin = $('.learner-list').length > 0 ? parseInt($('.learner-list').first().css('margin-top').replace("px", "")) : 0;

    var viewPortHeight = viewport.outerHeight() - attendeeInQuiz - learnerListMargin;

    /* The height of the learner button must be set manually if the html elements are not yet generated */
    var btnLearnerHeight = $('.btn-learner').first().parent().outerHeight() ? $('.btn-learner').first().parent().outerHeight() : 54;

    /* Calculate how much buttons we can place in the viewport until we need to scroll */
    var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);

    /*
     Multiply the displayed elements by 3 if on widescreen and reduce the max output of buttons by 1 row for the display
     more button if necessary. Also make sure there is at least one row of buttons shown even if the user has to scroll
     */
    var allMembers = MemberList.find().count();
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

export function setMemberlistObserver (options) {
    memberlistObserver = MemberList.find().observeChanges(options);
}