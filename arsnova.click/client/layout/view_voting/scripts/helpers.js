Template.votingview.helpers({
    answerOptions: function () {
        return AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort: {answerOptionNumber: 1}});
    },
    showForwardButton: function () {
        return Session.get("hasToggledResponse") && !(Session.get("hasSendResponse"));
    },
    answerOptionLetter: function (number) {
        return String.fromCharCode((number.hash.number + 65));
    },
    getCountdown: function () {
        if (Session.get("countdownInitialized")) {
            if (countdown.get() === 1) {
                return "Noch 1 Sekunde!";
            }
            return "Noch " + countdown.get() + " Sekunden!";
        }
    }
});