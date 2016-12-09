Package.describe({
  name: 'arsnova.click:introjs',
  version: '2.3.0',
  summary: 'Meteor package for intro.js',
  git: 'https://github.com/usablica/intro.js.git'
});

Package.onUse(function(api) {
  api.add_files('./lib/intro.js/intro.js', 'client');
  api.add_files('./lib/intro.js/introjs.css', 'client');
  api.add_files('./lib/intro.js/themes/introjs-nazanin.css', 'client');
  api.add_files('./lib/main.js', 'client');
  api.export('introJs', 'client');
});
