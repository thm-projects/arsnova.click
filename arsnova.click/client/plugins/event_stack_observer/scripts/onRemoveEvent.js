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

import * as localData from '/lib/local_storage.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {globalEventStackObserver} from '/client/plugins/event_stack_observer/scripts/lib.js';

function addDefaultRemoveEvents() {
	globalEventStackObserver.onRemove(function () {
		if (!localData.containsHashtag(Router.current().params.quizName)) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: "plugins.splashscreen.error.error_messages.session_closed"
			});
		}
		Router.go("/" + Router.current().params.quizName + "/resetToHome");
	});
}

export function getRemoveEventsForRoute(route) {
	if (typeof route === "undefined" || !route.startsWith(":quizName.") || !globalEventStackObserver || !globalEventStackObserver.isRunning()) {
		return;
	}
	route = route.replace(":quizName.", "");

	addDefaultRemoveEvents();
}
