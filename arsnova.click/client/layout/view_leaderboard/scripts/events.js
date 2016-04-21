Template.leaderBoard.events({
    'click #showMore': ()=> {
        Session.set('show_all_leaderboard', true);
    },
    'click #showLess': ()=> {
        Session.set('show_all_leaderboard', false);
    },
    'click #js-btn-backToResults': ()=> {
        Router.go('/results');
    }
});