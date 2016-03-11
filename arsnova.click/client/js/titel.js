/**
 * Created by antoschka on 08.03.16.
 */

Template.titel.onRendered(function () {
    $(window).resize(function () {

        var final_height = $(window).height() - $(".navbar").height();
        $(".margin-to-logo").css("margin-top", $(".navbar").height());
        $(".container").css("height", final_height);
    });
});


Template.titel.rendered = function () {
    var final_height = $(window).height() - $(".navbar").height();

    $(".margin-to-logo").css("margin-top", $(".navbar").height());
    $(".container").css("height", final_height);
};