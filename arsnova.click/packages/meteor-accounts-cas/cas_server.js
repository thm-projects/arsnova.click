var Fiber = Npm.require('fibers');
var url = Npm.require('url');
var CAS = Npm.require('node-cas');

var _casCredentialTokens = {};

RoutePolicy.declare('/_cas/', 'network');

// Listen to incoming OAuth http requests
WebApp.connectHandlers.use(function (req, res, next) {
	// Need to create a Fiber since we're using synchronous http calls and nothing
	// else is wrapping this in a fiber automatically
	Fiber(function () {
		middleware(req, res, next);
	}).run();
});

middleware = function (req, res, next) {
	req.session = req.session || {};
	res.redirect = res.redirect || function (url) {
			if (url) {
				res.writeHead(301, {Location: url});
				res.end();
			} else {
				Meteor.bindEnvironment(function () {
					window.close();
				});
			}
		};
	// Make sure to catch any exceptions because otherwise we'd crash
	// the runner
	try {
		var barePath = req.url.substring(0, req.url.indexOf('?'));
		var splitPath = barePath.split('/');

		// Any non-cas request will continue down the default
		// middlewares.
		if (splitPath[1] !== '_cas') {
			next();
			return;
		}

		// get auth token
		var credentialToken = splitPath[2];
		if (!credentialToken) {
			closePopup(res);
			return;
		}

		// validate ticket
		casTicket(req, res, credentialToken, function () {
			closePopup(res);
		});

	} catch (err) {
		console.log("account-cas: unexpected error : " + err.message);
		closePopup(res);
	}
};

var casTicket = function (req, res, token, callback) {
	// get configuration
	if (!Meteor.settings.cas && !Meteor.settings.cas.validate) {
		console.log("accounts-cas: unable to get configuration");
		callback();
	}

	// get ticket and validate.
	var parsedUrl = url.parse(req.url, true);
	var ticketId = parsedUrl.query.ticket;
	var absolute_url = Meteor.absoluteUrl();
	var lIndex  = absolute_url.lastIndexOf("/");
	absolute_url = absolute_url.substring(0, lIndex);

	console.log(absolute_url, parsedUrl);
	var cas = new CAS({
		cas_url: Meteor.settings.cas.baseUrl,
		service_url: absolute_url + parsedUrl.pathname,
		cas_version: "2.0"
	});

	cas.authenticate(req, res, Meteor.bindEnvironment(function (err, status, profile, sections) {
		if (err) {
			console.log("accounts-cas: error when trying to validate " + err);
		} else {
			if (status) {
				console.log("accounts-cas: user validated ", profile);
				_casCredentialTokens[token] = profile;
			} else {
				console.log("accounts-cas: unable to validate " + ticketId);
			}
		}
		callback();
	}));
};

/*
 * Register a server-side login handle.
 * It is call after Accounts.callLoginMethod() is call from client.
 *
 */
Accounts.registerLoginHandler(function (options) {

	if (!options.cas)
		return undefined;

	if (!_hasCredential(options.cas.credentialToken)) {
		throw new Meteor.Error(Accounts.LoginCancelledError.numericError,
			'no matching login attempt found');
	}

	var result = _retrieveCredential(options.cas.credentialToken);
	options = {profile: result};
	const user = Accounts.updateOrCreateUserFromExternalService("cas", result, options);
	console.log("cas user: ", user);
	return user;
});

var _hasCredential = function (credentialToken) {
	return _.has(_casCredentialTokens, credentialToken);
};

/*
 * Retrieve token and delete it to avoid replaying it.
 */
var _retrieveCredential = function (credentialToken) {
	var result = _casCredentialTokens[credentialToken];
	delete _casCredentialTokens[credentialToken];
	return result;
};

var closePopup = function (res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	var content = '<html><body><div id="popupCanBeClosed"></div></body></html>';
	res.end(content, 'utf-8');
};
