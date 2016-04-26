import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

Template.leaderBoard.onCreated(function () {
    this.subscribe('Responses.session', Session.get("hashtag"));
    this.subscribe('AnswerOptions.options', Session.get("hashtag"));
    this.subscribe('MemberList.members', Session.get("hashtag"));
    this.subscribe('QuestionGroup.questionList', Session.get("hashtag"));
    this.subscribe("EventManager.join", Session.get("hashtag"));

    Session.set('show_all_leaderboard', false);
});