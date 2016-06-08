
import {TAPi18n} from 'meteor/tap:i18n';
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
