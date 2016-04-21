import localData from './../../../lib/local_storage';

Template.hashtag_view.onCreated(function () {
    this.subscribe('Hashtags.public', ()=> {
        Hashtags.find().observeChanges({
            added: function (id, doc) {
                if (doc.hashtag === $("#hashtag-input-field").val()) {
                    $("#addNewHashtag").attr("disabled", "disabled");
                }
            }
        });
    });
    this.autorun(()=> {
        this.subscribe("EventManager.join", Session.get("hashtag"), ()=> {
            if (!EventManager.findOne({hashtag: Session.get("hashtag")}) || localData.containsHashtag(Session.get("hashtag")) > -1) {
                $("#joinSession").attr("disabled", "disabled");
                return;
            }
            EventManager.find().observeChanges({
                changed: function (id, changedFields) {
                    if (!isNaN(changedFields.sessionStatus)) {
                        if (changedFields.sessionStatus === 2) {
                            $("#joinSession").removeAttr("disabled");
                        } else {
                            $("#joinSession").attr("disabled", "disabled");
                        }
                    }
                },
                added: function (id, doc) {
                    if (!isNaN(doc.sessionStatus)) {
                        if (doc.sessionStatus === 2) {
                            $("#joinSession").removeAttr("disabled");
                        } else {
                            $("#joinSession").attr("disabled", "disabled");
                        }
                    }
                }
            });
        });
    });
});

Template.hashtagManagement.onCreated(function () {
    this.subscribe('Hashtags.public');
});