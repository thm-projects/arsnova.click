Package.describe({
  name: "arsnova.click:i18n-bundler",
  summary: "Bundles your project's tap-i18n files and pre-loads them on the client automatically",
  version: '0.3.0',
  git: 'https://github.com/TAPevents/tap-bundler'
});

Package.on_use(function(api) {
  api.versionsFrom('1.1.0.3');

  api.use([
    'coffeescript',
    'jquery',
    'tap:i18n@1.7.0'
  ], ['client', 'server']);

  api.add_files("i18n-bundler.coffee", "server");
  api.add_files("i18n-bundle-receiver.coffee", "client");

});
