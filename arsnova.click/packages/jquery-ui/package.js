Package.describe({
	name: 'arsnova.click:jquery-ui',
	version: '1.12.1',
	summary: 'Current version of the JQuery UI package containing Draggable, Sortable & Droppable Widgets',
	git: 'https://github.com/jquery/jquery-ui',
	documentation: null
});

Package.onUse(function (api) {
	api.versionsFrom('1.3.2.1');
	api.use('jquery');
	api.add_files('./jquery-ui.min.js', 'client');
	api.add_files('./jquery-ui.min.css', 'client');
});
