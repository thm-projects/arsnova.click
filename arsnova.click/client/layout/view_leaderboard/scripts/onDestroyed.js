import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

Template.leaderBoard.onDestroyed(function () {
    Session.set("showLeaderBoardId", undefined);
    Session.set('show_all_leaderboard', undefined);
});