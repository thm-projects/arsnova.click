const system = require('system'),
	args = system.args,
	page = require("webpage").create();

page.viewportSize = {
	width: 1280,
	height: 720
};
page.onConsoleMessage = function (message) {
	console.log('Received message from phantomjs process:', message);
};
function handlePage(url) {
	console.log("Requesting page load:", url);
	page.open(url, function (status) {
		const urlSeparated = url.split("/");
		page.onCallback = function () {
			console.log('Page', url, 'is loaded and ready with status:', status);
			page.render('arsnova_click_preview_' + urlSeparated[urlSeparated.length - 2] + '_' + urlSeparated[urlSeparated.length - 1] + '.png');
			setTimeout(nextPage, 100);
		};
		setTimeout(function () {
			page.evaluate(function () {
				callPhantom();
			});
		}, 800);
	});
}
function nextPage() {
	const url = args.shift();
	if (!url) {
		console.log("All files have been handled, exiting process");
		phantom.exit(0);
	}
	const host = /localhost/.test(url) ? "localhost" : /staging.arsnova.click/.test(url) ? "staging.arsnova.click" : /arsnova.click/.test(url) ? "arsnova.click" : "";
	phantom.addCookie({
		'name': 'cookieconsent_dismissed',
		'value': 'yes',
		'domain': host,
		'path': '/',
		'expires': (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
	});
	console.log("Handling url", url, "from args", args);
	handlePage(url);
}
args.shift();
nextPage();
