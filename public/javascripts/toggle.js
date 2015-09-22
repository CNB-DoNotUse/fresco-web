/*  Toggle
	by Imogen Olsen, 2015
*/

$(document).ready(function() {
	var body = $("body");
	$("[data-toggle-role='controller']").on("click", function(event) {
		event.stopImmediatePropagation();
		var id = $(this).attr("data-toggle-id");
		var target = $("[data-toggle-id='" + id + "'][data-toggle-role='target']");
		var action = $(this).attr("data-toggle-action");
		if (action == "enable") {
			target.transition({top: "0"}).transition({opacity: 1});
			target.children("span").transition({y: "0px"});
			target.children("div").transition({y: "0"});
			body.addClass("toggled");
		} else if (action == "disable") {
			target.transition({opacity: 0}).transition({top: "200%"});
			target.children("span").transition({y: "-96px"});
			target.children("div").transition({y: "100%"});
			body.removeClass("toggled");
			
			if (typeof player !== 'undefined')
				player.pauseVideo()
		} else {
			// target.toggleClass("toggled");
			// body.toggleClass("toggled");
		}
	});
});