const system = require('system'),
	  args = system.args,
	  casper = require('casper').create(),
	  url = args[1] + args[2];

casper.then(function() {
	this.echo('First Page: ' + this.getTitle());
});
casper.start(url);
casper.run();
