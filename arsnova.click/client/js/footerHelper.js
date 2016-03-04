Template.footer.helpers({
    isInHomePath: function () {
        return Router.current().route.path() === '/';
    }
});