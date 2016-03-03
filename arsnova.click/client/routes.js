Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', function () {
    this.render('home');
});

Router.route('/nick', function () {
});

Router.route('/question', function () {
    if (Session.get("isOwner")) {
		this.render('createQuestionView');
    }
});

Router.route('/answeroptions', function () {
    if (Session.get("isOwner")) {

    }
});

Router.route('/settimer', function () {
    if (Session.get("isOwner")) {

    }
});

Router.route('/readconfirmation', function () {
    if (Session.get("isOwner")) {

    } else {

    }
});

Router.route('/memberlist', function () {
});

Router.route('/onpolling', function () {
    if (Session.get("isOwner")) {

    } else {

    }
});

Router.route('/statistics', function () {
});

Router.route('/results', function () {
});