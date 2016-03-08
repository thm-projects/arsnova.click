Meteor.setInterval(function () {
    Meteor.call('keepalive', localStorage.getItem("privateKey"));
}, 5000);