Template.nick.onCreated(function () {
    this.autorun(() => {
        this.subscribe('MemberList.members', Session.get("hashtag"));
    });
});

Template.nick.onRendered(function () {
    $("#forwardButton").attr("disabled", "disabled");
});

Template.nick.events({
    "click #forwardButton": function () {
        var nickname = $("#nickname-input-field").val();
        var bgColor = rgbToHex(getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255));
        Meteor.call('MemberList.addLearner', {
            hashtag: Session.get("hashtag"),
            nick: nickname,
            backgroundColor: bgColor,
            foregroundColor: transformForegroundColor(hexToRgb(bgColor))
        }, (err, res) => {
            if (err) {
                alert(err);
            } else {
                Session.set("nick", nickname);
                Router.go("/memberlist");
            }
        });
    },
    "click #backButton": function () {
        Router.go("/");
    },
    'input #nickname-input-field': function (event) {
        var hashtag = Session.get("hashtag");
        var currentNickName = event.currentTarget.value;
    var member = MemberList.findOne({nick: currentNickName});

        if (currentNickName.length > 2 && !member) {
            $("#forwardButton").removeAttr("disabled");
        } else {
            $("#forwardButton").attr("disabled", "disabled");
        }
    },
    "keydown #nickname-input-field": function(event){
        if(event.keyCode==13){
            var currentNickName = event.currentTarget.value;
            var member = MemberList.findOne({nick: currentNickName});

            if (currentNickName.length > 2 && !member) {
                $("#forwardButton").click();
            }
        }
    }
});

function hexToRgb (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function componentToHex (c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex (r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function transformForegroundColor (rgbObj) {
    var o = Math.round(((parseInt(rgbObj.r) * 299) + (parseInt(rgbObj.g) * 587) + (parseInt(rgbObj.b) * 114)) / 1000);
    return o > 125 ? "#ffffff" : "#000000";
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}