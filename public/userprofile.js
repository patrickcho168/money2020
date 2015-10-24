$(document).ready(function() {
$(".btn-pref .btn").click(function () {
    $(".btn-pref .btn").removeClass("btn-primary").addClass("btn-default");
    $(".well .tab-pane").removeClass("active"); // instead of this do the below 
    var tab_id = $(this).attr("href")
    $(tab_id).addClass("active");
    $(this).removeClass("btn-default").addClass("btn-primary");   
});
});