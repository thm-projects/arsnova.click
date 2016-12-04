
import {Template} from 'meteor/templating';

Template.quizManager.events({
	"click #added_questions_wrapper .draggable": function (event) {
		console.log(event.currentTarget.id.replace("_added_question", ""));
	}
});
