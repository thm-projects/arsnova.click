Template.live_results.onCreated(function () {
    this.autorun(() => {
        this.subscription = Meteor.subscribe('Responses.instructor', "wpw");
        console.log("HIER: "+Responses.find().count());
    });
});

Template.live_results.helpers({
    result: function () {
        return Responses.find();
    }
});
