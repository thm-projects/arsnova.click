const system = require('system'),
	  args = system.args,
	  page = require("webpage").create(),
	  url = args[1] + args[2] + "/" + args[3];

const host = /localhost/.test(args[1]) ? "localhost" : /staging.arsnova.click/.test(args[1]) ? "staging.arsnova.click" : /arsnova.click/.test(args[1]) ? "arsnova.click" : "";
page.viewportSize = {
	width: 1920,
	height: 1080
};
phantom.addCookie({
	'name'     : 'cookieconsent_dismissed',
	'value'    : 'yes',
	'domain'   : host,
	'path'     : '/',
	'expires'  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
});
page.open(url, function () {
	console.log("Requesting page load: ", url);
	page.onCallback = function() {
		console.log('Page ( ' + url + ' ) is loaded and ready');
		page.render('arsnova_click_preview_' + args[2] + '_' + args[3] + '.png');
		phantom.exit();
	};
});
page.onConsoleMessage = function (message) {
	console.log('Received message: ' + message);
};
