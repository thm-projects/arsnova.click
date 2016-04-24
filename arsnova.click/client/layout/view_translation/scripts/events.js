import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

Template.translate.events({
    'click .available_translations button': function() {
        return TAPi18n.setLanguageAmplify(this.tag);
    },
    'click #backButton': function () {
        Router.go("/");
    }
});