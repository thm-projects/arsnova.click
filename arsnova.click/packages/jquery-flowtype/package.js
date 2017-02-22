Package.describe({
	name: 'arsnova.click:jquery-flowtype',
	version: '1.1.0',
	summary: 'Current version of the JQuery FlowType package',
	git: 'https://github.com/simplefocus/FlowType.JS',
	documentation: null
});

Package.onUse(function (api) {
	api.versionsFrom('1.3.2.1');
	api.use([
		'ecmascript',
		'jquery'
	], 'client');
	api.mainModule('jquery-flowtype.js', 'client');
});
