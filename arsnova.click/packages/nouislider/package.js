Package.describe({
	name: 'arsnova.click:nouislider',
	version: '8.5.1',
	summary: 'Current version of the noUiSlider package',
	git: 'https://github.com/leongersen/noUiSlider',
	documentation: null
});

Package.onUse(function (api) {
	api.versionsFrom('1.3.2.1');
	api.use('ecmascript');
	api.addFiles('./v8_5_1.min.css', 'client');
	api.mainModule('nouislider.js');
});
