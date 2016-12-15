# TAPi18n Bundler

The purpose of this package is to allow for client-only deploys of Meteor apps that use [tap-i18n](http://github.com/tapevents/tap-i18n).

## Usage

`meteor add tap:i18n-bundler`

Set your `cdn_path` in `project-tap.i18n` to `i18n`

Now your Cordova and `meteor-build-client` bundles have all i18n files available offline.

`tap:i18n-bundler` will automatically maintain a `/public/i18n/` folder within your Meteor project in the following way:

```javascript
.meteor/
project-tap.i18n // see tap:i18n
  { "cdn_path" : "i18n" }
myApp.html // your templates, using `{{_ "translate_me"}}`
public/
  i18n/ // this folder is created by `tap:i18n-bundler`
    tap-i18n.json // contains all languages
    en.i18n.json
    zh.i18n.json
    de.i18n.json
i18n/ // your project's i18n files
  en.i18n.json
  zh.i18n.json
packages/
  myPackage/
    package.js
    package-tap.i18n
    i18n/ // 3rd party package i18n files
      en.i18n.json
      de.i18n.json
```

This package will combine all languages accross project and packages into a unified json file for each language, which are dynamically loaded when the client's language changes and are served from the `/public/i18n` directory - accessible in Cordova and other client-based deployment environmnents. It's designed specifically as a way of supporting Cordova and [meteor-build-client](https://github.com/frozeman/meteor-build-client) with `tap:i18n`.

All of the files in `/public/i18n` will be automatically re-generated if you change any of your project's `lang.i18n.json` files.

**This package only maintains the public folder in development mode** the files should be generated in development and be re-deployed each time they change. You should edit your the original files, not the generated one!

On the client, `tap:i18n-bundler` requests the relevant `ROOT_URL/i18n/language.i18n.json` language file only when required. This saves memory by not pre-loading everything. If you prefer to pre-load all of the languages into memory, set `TAPi18n.precacheBundle = true`. This will make a single ajax request for `i18n/tap-i18n.json`, which contains all language data when the app first loads.

## Examples

### Static Files Version

Have a look at the `/examples/example-static` for a [`meteor-build-client`](https://github.com/frozeman/meteor-build-client) compatible example.

```bash
cd ./examples/example-static
meteor # run meteor once to rebuild the language files, then exit
meteor-build-client ./../build/ --path ""
```

### Cordova

```bash
cd ./examples/example-cordova
meteor # run meteor once to rebuild the language files, then exit
meteor run android
```

## Why do we need `i18n-bundler`?

Until tap-i18n supports native bundling (which will require a breaking change), this is a way of solving https://github.com/TAPevents/tap-i18n/issues/93 etc.

The main difficulty is that `tap:i18n` generates packages that are pre-built with their specific fallback language, and can't be modified during the build process easily. As such, re-building a unified file for client deployment has to be done after the build process.

Whilst this solution is not most elegent and requires Meteor to run before the project can be re-deployed, it uses Meteor's default static filesystem, which should be somewhat futureproofed.

Other failed approaches were:

* meterhacks:fastrender
  * Doesn't work because it injects request responses; most client build processes use a static index.html so we don't get a chance to inject after bundling
* Changing the TAP-i18n build process
  * This didn't work because 3rd party packages are built and shipped with whatever config the package author gives, so they'd have to rebuild a version for each conceivable combination of `supported_languages`


MIT License, Chris Hitchcott, 2015
