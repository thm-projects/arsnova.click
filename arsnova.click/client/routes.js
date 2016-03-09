Router.configure({
    layoutTemplate: 'layout'
});

Router.map(function () {
    if (!Session.get("hashtag")) {
        this.go("/");
    }
});

Router.route('/', function () {
    localData.initializePrivateKey();
    Session.set("isOwner", undefined);
    this.render('home');
});

Router.route('/nick', function () {
    this.render('nick');
});

Router.route('/question', function () {
    if (Session.get("isOwner")) {
		this.render('createQuestionView');
    } else {
        Router.go("/");
    }
});

Router.route('/answeroptions', function () {
    this.render('createAnswerOptions');
});

Router.route('/settimer', function () {
    if (Session.get("isOwner")) {
        this.render('createTimerView');
    } else {
        Router.go('/');
    }
});

Router.route('/readconfirmationrequired', function () {
    if (Session.get("isOwner")) {
        this.render('readconfirmationrequired');
    } else {
        Router.go("/");
    }
});

Router.route('/memberlist', function () {
    this.render('memberlist');
});

Router.route('/votingview', function () {
    this.render('votingview');
});

Router.route('/onpolling', function () {
    if (Session.get("isOwner")) {
        this.render('live_results');
    } else {
        this.render('votingview');
    }
});

Router.route('/results', function () {
    this.render('votingview');
});

Router.route('/statistics', function () {
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