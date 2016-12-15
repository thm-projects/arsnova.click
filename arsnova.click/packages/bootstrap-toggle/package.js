Package.describe({
	name: 'arsnova.click:bootstrap-toggle',
	version: '2.2.2',
	summary: 'Current version of the Bootstrap Toggle package',
	git: 'https://github.com/minhur/bootstrap-toggle',
	documentation: null
});

Package.onUse(function (api) {
	api.versionsFrom('1.3.2.1');
	api.add_files('./bootstrap-toggle.min.js', 'client');
	api.add_files('./bootstrap-toggle.min.css', 'client');
});
