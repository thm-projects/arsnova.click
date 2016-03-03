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


// Routes for Footer-Links

Router.route('/ueber', function () {
    this.render('ueber');
});

Router.route('/agb', function () {
    this.render('agb');
});

Router.route('/datenschutz', function () {
    this.render('datenschutz');
});

Router.route('/impressum', function () {
    this.render('impressum');
});