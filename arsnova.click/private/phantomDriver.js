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
function handle_page(url){
	console.log("Requesting page load:", url);
	page.open(url, function(status) {
		const urlSeparated = url.split("/");
		console.log('Page', url, 'is loaded and ready with status:', status);
		setTimeout(function () {
			page.render('arsnova_click_preview_' + urlSeparated[urlSeparated.length - 2] + '_' + urlSeparated[urlSeparated.length - 1] + '.png');
			setTimeout(next_page, 100);
		}, 500);
	});
}
function next_page(){
	const url=args.shift();
	if (!url){
		console.log("All files have been handled, exiting process");
		phantom.exit(0);
	}
	const host = /localhost/.test(url) ? "localhost" : /staging.arsnova.click/.test(url) ? "staging.arsnova.click" : /arsnova.click/.test(url) ? "arsnova.click" : "";
	phantom.addCookie({
		'name'     : 'cookieconsent_dismissed',
		'value'    : 'yes',
		'domain'   : host,
		'path'     : '/',
		'expires'  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
	});
	console.log("Handling url", url, "from args", args);
	handle_page(url);
}
args.shift();
next_page();
