(function($) {
	$.fn.flowtype = function(options) {

		// Establish default settings/variables
		// ====================================
		const settings = $.extend({
				maximum   : 9999,
				minimum   : 1,
				maxFont   : 9999,
				minFont   : 1,
				fontRatio : 35
			}, options),

			// Do the magic math
			// =================
			changes = function(el) {
				const $el = $(el),
					elw = $el.width(),
					width = elw > settings.maximum ? settings.maximum : elw < settings.minimum ? settings.minimum : elw,
					fontBase = width / settings.fontRatio,
					fontSize = fontBase > settings.maxFont ? settings.maxFont : fontBase < settings.minFont ? settings.minFont : fontBase;
				$el.css('font-size', fontSize + 'px');
			};

		// Make the magic visible
		// ======================
		return this.each(function() {
			// Context for resize callback
			const that = this;
			// Make changes upon resize
			$(window).resize(function(){changes(that);});
			// Set changes on load
			changes(this);
		});
	};
}(jQuery));
