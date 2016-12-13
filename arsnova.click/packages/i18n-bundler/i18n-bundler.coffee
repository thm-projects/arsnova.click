if process.env.NODE_ENV is 'development'

  fs = Npm.require "fs"
  staticRoot = process.cwd() + "/public"
  assetsPath = staticRoot + "/i18n"
  i18nAll = assetsPath + "/tap-i18n.json"

  Meteor.startup ->
    # read the current
    if fs.existsSync i18nAll
      currenti18n = fs.readFileSync(i18nAll).toString()
    # create the bundle and use it as a basic cache
    newi18n = JSON.stringify TAPi18n.translations
    # overwrite if different
    if newi18n isnt currenti18n
      # create directories if they don't exist
      unless fs.existsSync staticRoot
        fs.mkdirSync staticRoot
      unless fs.existsSync assetsPath
        fs.mkdirSync assetsPath
      # write all languages bundle
      fs.writeFileSync i18nAll, newi18n
      # TODO delete all the unused files
      # write individual files
      for key, language of TAPi18n.translations
        fs.writeFileSync "#{assetsPath}/#{key}.json", JSON.stringify(language)
