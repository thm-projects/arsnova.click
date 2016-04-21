import localData from './../../../lib/local_storage';

Template.soundConfig.onCreated(function () {
    Session.setDefault("slider2", 80);
    this.autorun(() => {
        this.subscribe('Sessions.instructor', localData.getPrivateKey(), Session.get("hashtag"));
    });
});
