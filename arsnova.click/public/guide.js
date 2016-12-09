(function ( $ ) {

	var guide = function() {
		var container,
			defaults = {
				margin: 10
			},
			topMask = $("<div/>").addClass("guideMask"),
			bottomMask = $("<div/>").addClass("guideMask"),
			leftMask = $("<div/>").addClass("guideMask"),
			rightMask = $("<div/>").addClass("guideMask"),
			bubble = $("<div/>").addClass("guideBubble"),
			holdingSteps,
			steps,
			position,

			prevButton = $("<button/>").addClass("btn btn-danger").html("Prev"),
			nextButton = $("<button/>").addClass("btn btn-success").html("Next"),
			arrow = $("<div/>").addClass("guideBubble-arrow").addClass("top"),

			gotoStep = function(i) {
				positionMask(i);
				positionBubble(i);
			},
			nextStep = function() {
				position++;
				if (position>=steps.length) {
					clearGuide();
				} else {
					gotoStep(position);
				}
			},
			prevStep = function() {
				position--;
				if (position<0) {
					position = steps.length - 1;
				}
				gotoStep(position);
			},
			getElementAttrs = function(element) {
				return {
					top: element.offset().top,
					left: element.offset().left,
					width: element.outerWidth(),
					height: element.outerHeight()
				}
			},
			positionMask = function(i) {
				var element = steps[i].element,
					margin = (steps[i].options && steps[i].options.margin) ? steps[i].options.margin : options.margin,
					attrs = getElementAttrs(element),
					top = attrs.top,
					left = attrs.left,
					width = attrs.width,
					height = attrs.height;

				topMask.css({
					height: (top - margin) + "px"
				});

				let bottomMaskTop = (height + top + margin) + "px";
				if (bottomMaskTop > $('#theme-wrapper').height()) {
					bottomMaskTop = "auto";
				}
				bottomMask.css({
					top: bottomMaskTop,
					bottom: bottomMaskTop === "auto" ? $('.fixed-bottom').outerHeight() + $('.navbar-fixed-bottom').outerHeight() : "auto",
					height: ($(document).height() - height - top - margin) + "px",
					"min-height": bottomMaskTop === "auto" ? $('.fixed-bottom').outerHeight() + $('.navbar-fixed-bottom').outerHeight() : "auto"
				});

				leftMask.css({
					width: (left - margin) + "px",
					top: (top - margin) + "px",
					height: (height + margin*2) + "px"
				});

				rightMask.css({
					left: (left + width + margin) + "px",
					top: (top - margin) + "px",
					height: (height + margin*2) + "px",
					width: ($(document).width() - width - left - margin) + "px",
				});
			},
			positionBubble = function(i) {
				var element = steps[i].element,
					margin = (steps[i].options && steps[i].options.margin) ? steps[i].options.margin : options.margin,
					top = element.offset().top,
					left = element.offset().left,
					width = element.outerWidth(),
					height = element.outerHeight();

				console.log(element);
				var css = {};
				if (top + height + bubble.outerHeight() > $('#theme-wrapper').height()) {
					css.top = "auto";
					css.bottom = (top + margin + 10) + "px";
					arrow.removeClass("top").addClass("bottom");
				} else {
					css.top = (height + top + margin + 10) + "px";
					css.bottom = "auto";
					arrow.removeClass("bottom").addClass("top");
				}

				if ((left + bubble.outerWidth()) > $(document).width()) {
					$(".guideBubble-arrow", bubble).css({"right": "10px"});
					css.left = left + element.outerWidth() - bubble.outerWidth() + margin;
				} else {
					$(".guideBubble-arrow", bubble).css({"right": "auto"});

					css.left = left - margin;
				}

				$(".step", bubble).html(i + 1);
				$(".intro", bubble).html(steps[i].intro);
				bubble.animate(css, 500, function() {
					scrollIntoView();
					if (steps[i].options.callback) {
						steps[i].options.callback();
					}
				});
				prevButton.removeClass("disabled");
				nextButton.removeClass("disabled");

				if (!position) {
					prevButton.addClass("disabled");
				}

				if (position==(steps.length-1)) {
					nextButton.html("Close").addClass("btn-danger");
				} else {
					nextButton.html("Next").removeClass("btn-danger");
				}


				scrollIntoView();
			},
			scrollIntoView = function() {
				var element = steps[position].element;

				if (($(document).scrollTop()>element.offset().top) || (($(document).scrollTop() + $("body").height())<element.offset().top)) {
					$('html, body').animate({
						scrollTop: element.offset().top - 20
					});
				}
			},
			clearGuide = function() {
				bubble.detach();
				topMask.add(bottomMask).add(leftMask).add(rightMask).animate({
					opacity: 0
				}, 500, function() {
					topMask.add(bottomMask).add(leftMask).add(rightMask).detach();
				})

			},
			getMaximumZIndex = function() {
				var max = 0;
				$("*").each(function() {
					var current = parseInt($(this).css("zIndex"), 10);
					if(current > max) {
						max = current;
					}
				});
				return max;
			}


		return {
			init: function(opts) {
				container = $(this);
				options = $.extend({}, defaults, opts);
				steps = [];
				holdingSteps = [];
				position = -1;
				//zIndex = getMaximumZIndex();
				zIndex = 1070;

				topMask.add(bottomMask).add(leftMask).add(rightMask).css("z-index", zIndex + 1);
				bubble.css("z-index", zIndex + 2).html("").append(arrow).append($("<div/>").addClass("step").html("1")).append($("<div/>").addClass("intro")).append($("<div/>").addClass("btn-group pull-right").append(prevButton).append(nextButton));

				prevButton.on("click", function() {
					if (!$(this).hasClass("disabled")) {
						prevStep();
					}
				});
				nextButton.on("click", function() {
					if (!$(this).hasClass("disabled")) {
						nextStep();
					}
				});

				topMask.add(bottomMask).add(leftMask).add(rightMask).on("click", function() {
					clearGuide();
				});

				return {
					addStep: function(selector, introduction, options) {
						holdingSteps.push({
							selector: selector,
							intro: introduction,
							options: options || {}
						});
					},
					start: function() {
						container.append(topMask, bottomMask, leftMask, rightMask);
						container.append(bubble);
						topMask.add(bottomMask).add(leftMask).add(rightMask).animate({
							opacity: 0.5
						}, 500);
						position = -1;
						steps = [];
						$.each(holdingSteps, function(i, step) {
							if ($(step.selector).length) {
								var attrs = getElementAttrs($(step.selector));
								if (attrs.width!=0 && attrs.height!=0) {
									steps.push({
										element: $(step.selector),
										selector: step.selector,
										intro: step.intro,
										options: step.options
									});
								}
							}
						});
						nextStep();
					}
				}
			},

		}
	}();

	$.fn.extend({
		guide: guide.init
	});
}( jQuery ));
