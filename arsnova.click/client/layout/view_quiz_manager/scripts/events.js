
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";

Template.quizManager.events({
	"click #added_questions_wrapper .draggable": function (event, ui) {
		console.log(event.currentTarget.id.replace("_added_question", ""));
	}
});
