import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { getLeaderBoardItems } from './lib.js';

Template.leaderBoard.helpers({
    hashtag: ()=> {
        return Session.get("hashtag");
    },
    getNormalizedIndex: (index)=> {
        return index + 1;
    },
    isNumber: (index)=> {
        return !isNaN(index);
    },
    getTitleText: ()=> {
        if (typeof Session.get("showLeaderBoardId") !== "undefined") {
            return "Quizfrage " + (Session.get("showLeaderBoardId") + 1) + ": Alles richtig haben...";
        } else {
            return "Alles richtig haben...";
        }
    },
    getPosition: function (index) {
        return (index + 1);
    },
    parseTimeToSeconds: function (milliseconds) {
        return Math.round((milliseconds / 10), 2) / 100;
    },
    showAllLeaderboard: ()=> {
        return Session.get('show_all_leaderboard');
    },
    noLeaderBoardItems: (index)=> {
        var items = getLeaderBoardItems();
        if (typeof index !== "undefined") {
            if (items[index].value.length > 0) {
                return false;
            }
        } else {
            for (var i = 0; i < items.length; i++) {
                if (items[i].value.length > 0) {
                    return false;
                }
            }
        }
        return true;
    },
    leaderBoardItems: ()=> {
        return getLeaderBoardItems();
    }
});