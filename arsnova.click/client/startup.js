/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import * as localData from '/client/lib/local_storage.js';
import { setErrorSplashscreen } from '/client/plugins/splashscreen/scripts/lib.js';

export function getUserLanguage() {
    /* Get the language of the browser */
    let userLang = navigator.language || navigator.userLanguage;
    /* Provide a fallback language */
    let selectedLang = "en";
    /* Get the language setting from the local storage */
    let localStorageLang = localData.getLanguage();
    /* Override the default language with the browser language if available */
    if(TAPi18n.languages_names[userLang]) {
        selectedLang = userLang;
    }
    /* Override the browser language with the set language of the local storage if available */
    if(TAPi18n.languages_names[localStorageLang.data]) {
        selectedLang = localStorageLang.data;
    }
    return selectedLang;
}

Meteor.startup(function(){
    if (Meteor.isClient) {
        $.getScript('/lib/highlight.pack.min.js');
        $.getScript('/lib/marked.min.js');
        TAPi18n.setLanguage(getUserLanguage());
        setErrorSplashscreen();
    }
});