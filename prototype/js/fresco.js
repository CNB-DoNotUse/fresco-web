/*  To-do:
	• Optimize event delegations to $([s]).on(click, [child], [handler]);
*/

$(document).ready(function() {
	$.material.init();
	// drawer
	$(".toggle-drawer.toggler").click(function() {
		$(".toggle-drawer").toggleClass("toggled");
	});
	// navbar drops
	$(".toggle-drop").click(function() {
		var drop =  $(this).siblings(".drop-menu");
		drop.toggleClass("toggled");
		if (drop.hasClass("toggled")) {
			var offset = drop.offset().left;
			while (offset + drop.outerWidth() > $(window).width() - 7) {
				drop.css("left", parseInt(drop.css("left")) - 1 + "px");
				offset = drop.offset().left;
			}
		}
		$(".dim.toggle-drop").toggleClass("toggled");
	});
	$(".toggle-drop.toggler").click(function() {
		$(".drop-menu").removeClass("toggled");
	});
	// tabs
	$(".related > .tab-control > button").click(function() {
		$(this).siblings().removeClass("toggled");
		$(this).toggleClass("toggled");
		$(this).parent().next().children(".tab").removeClass("toggled");
		if ($(this).hasClass("toggled")) {
			$(this).parent().next().children(".tab").eq($(this).index()).addClass("toggled");
		}
	});
	$(".card .tab-control > button").click(function() {
		$(this).siblings().removeClass("toggled");
		$(this).toggleClass("toggled");
		$(this).parents(".card-head").siblings(".card-body").find(".tab").removeClass("toggled");
		if ($(this).hasClass("toggled")) {
			$(this).parents(".card-head").siblings(".card-body").find(".tab").eq($(this).index()).addClass("toggled");
		}
	});
	// card
	$(".toggle-card.toggler").click(function() {
		$(".toggle-card").toggleClass("toggled");
		$(".cards").animate({ scrollTop: $(".cards")[0].scrollHeight}, 300);
	});
	// bulk selection
	$(".tile").click(function(event) {
		if (event.shiftKey && !$(this).hasClass("story")) {
			$(this).toggleClass("toggled");
			$(this).find(".tile-body > .img-responsive").toggleClass("toggled");
			$(this).find(".tile-foot").toggleClass("toggled");
			if ($(".tile").hasClass("toggled")) {
				$(".bulk").addClass("toggled");
			} else {
				$(".bulk").removeClass("toggled");
			}
		}
	});
	$("#clear").click(function(event) {
		$(".bulk").removeClass("toggled");
		$(".tile").removeClass("toggled");
		$(".tile-body > .img-responsive").removeClass("toggled");
		$(".tile-foot").removeClass("toggled");
	});
	// edit
	$(".toggle-edit.toggler").click(function() {
		$(".toggle-edit").toggleClass("toggled");
	});
	// edit story
	$(".toggle-sedit.toggler").click(function() {
		$(".toggle-sedit").toggleClass("toggled");
	});
	// create gallery
	$(".toggle-create.toggler").click(function() {
		$(".toggle-create").toggleClass("toggled");
	});
	// add article
	$(".toggle-add.toggler").click(function() {
		$(".toggle-add").toggleClass("toggled");
	});
});