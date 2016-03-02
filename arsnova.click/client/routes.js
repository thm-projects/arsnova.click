Router.configure({
	layoutTemplate: 'layout'
});
Router.route('/',function(){
	this.render('home');
});

Router.route('/createQuestionView', function(){
    this.render('createQuestionView');
});

