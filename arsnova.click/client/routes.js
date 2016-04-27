/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

import {Session} from 'meteor/session';
import * as localData from '/client/lib/local_storage.js';

Router.configure({
	layoutTemplate: 'layout'
});

Router.route('/', function () {
	try {
		localData.initializePrivateKey();
		Session.set("localStorageAvailable", true);
	} catch (err) {
		Session.set("localStorageAvailable", false);
	}

	Session.set("isOwner", undefined);
	Session.set("hashtag", undefined);
	Session.set("slider", undefined);
	this.render('home');
});

Router.route('/resetToHome', function () {
	$('.modal-backdrop').hide();
	Router.go("/");
});

Router.route('/nick', function () {
	if (!Session.get("hashtag")) {
		Router.go("/");
	}
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
		$('.modal-backdrop').hide();
		this.render('votingview');
	}
});

Router.route('/results', function () {
	this.render('live_results');
});

Router.route('/statistics', function () {
	this.render('leaderBoard');
});

Router.route('/hashtagmanagement', function () {
	this.render('hashtagManagement');
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

Router.route('/translate', function () {
	this.render('translate');
});

Router.onStop(function () {
	var lastRoute = Router.current().route.getName();
	if (lastRoute === undefined) {
		//homeView
		Session.set("lastPage", "/");
	} else if (lastRoute !== "agb" && lastRoute !== "datenschutz" && lastRoute !== "impressum") {
		Session.set("lastPage", lastRoute);
	}
});
