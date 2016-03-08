//todo: call this code when a user creates a new or Hashtag
Meteor.setInterval(function () {
    Meteor.call('keepalive', localStorage.getItem("privateKey"));
}, 5000);