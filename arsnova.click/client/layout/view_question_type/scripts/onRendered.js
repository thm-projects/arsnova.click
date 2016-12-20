
import {Template} from 'meteor/templating';
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import {getTooltipForRoute} from "/client/layout/global/scripts/lib.js";

Template.questionTypeView.onRendered(function () {
	const calculateRowHeight = function () {
		const questionTypeWrapper = $('.questionType').find(".wrapper");
		questionTypeWrapper.height("auto");
		const maxHeight = Math.max.apply(null, questionTypeWrapper.map(function () {
			return $(this).height();
		}).get());
		questionTypeWrapper.height(maxHeight);
	};
	$(window).on("resize",function () {
		calculateRowHeight();
	});
	Meteor.defer(function () {
		calculateRowHeight();
	});
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
	getTooltipForRoute();
});
