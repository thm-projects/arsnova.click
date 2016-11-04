Package.describe({
	name: 'arsnova.click:jquery-qr-code',
	version: '1.14.0',
	summary: 'Current version of the JQuery QR-Code package',
	git: 'https://github.com/lrsjng/jquery-qrcode',
	documentation: null
});

Package.onUse(function (api) {
	api.versionsFrom('1.3.2.1');
	api.use('ecmascript');
	api.mainModule('jquery-qrcode.js', 'client');
});
