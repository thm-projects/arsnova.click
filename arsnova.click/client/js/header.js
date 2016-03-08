Template.header.helpers({
    isInHomePathOrIsStudent: function () {
        switch (Router.current().route.path()) {
            case '/':
            case '/ueber':
            case '/agb':
            case '/datenschutz':
            case '/impressum':
                return true;
        }
        return !Session.get("isOwner");
    },
    currentHashtag: function () {
        return Session.get("hashtag");
    }
});