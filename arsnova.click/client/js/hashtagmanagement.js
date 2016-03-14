Template.hashtagManagement.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Hashtags.public');
    });
});