
import {Template} from 'meteor/templating';

Template.quizManager.events({
	"click #added_questions_wrapper .draggable": function (event) {
		Router.go("/" + Router.current().params.quizName + "/question/" + event.currentTarget.id.replace("_added_question", ""));
	}
});
