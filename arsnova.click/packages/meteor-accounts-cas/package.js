Package.describe({
  summary: "CAS support for accounts",
  version: "0.0.4",
  name: "arsnova.click:accounts-cas"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.3.0');
  api.use('routepolicy', 'server');
  api.use('webapp', 'server');
  api.use('accounts-base', ['client', 'server']);
  // Export Accounts (etc) to packages using this one.
  api.imply('accounts-base', ['client', 'server']);
  api.use('underscore');


  api.add_files('cas_client.js', 'web.browser');
  api.add_files('cas_client_cordova.js', 'web.cordova');
  api.add_files('cas_server.js', 'server');

});

Npm.depends({
  "node-cas": "1.0.1"
});

Cordova.depends({
  'cordova-plugin-inappbrowser': '1.2.0'
});
