Template.footer.helpers({
    isInHomePath: function () {
        return Router.current().route.path() === '/';
    },
    isBackButton: function () {
        var showHome = [
            "/",
            "agb",
            "datenschutz",
            "impressum",
            "ueber"
        ];
        var showHomeSl = [
            "/agb",
            "/datenschutz",
            "/impressum",
            "/ueber"
        ];
        return (showHomeSl.indexOf(Router.current().route.path()) !== -1) && (Session.get("lastPage") !== undefined) && (showHome.indexOf(Session.get("lastPage")) === -1) && (Router.current().route.path() !== '/');
    },
    getLastPage: function () {
        return Session.get("lastPage");
    }
});

Template.footer.events({
    "click #toPrevPage": function () {
        Session.set("lastPage", undefined);
    }
})