import {Template} from 'meteor/templating';
import {eventManagerHandle} from './lib.js';

Template.hashtagView.onDestroyed(function () {
	if (eventManagerHandle) {
		eventManagerHandle.stop();
		$("#joinSession").attr("disabled", "disabled");
	}
});
