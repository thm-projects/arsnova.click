
export const footerElemTranslation = {
	id: "translation",
	iconClass: "glyphicon glyphicon-globe",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.translation"
};
export const footerElemSound = {
	id: "sound",
	iconClass: "glyphicon glyphicon-music",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.sound"
};
export const footerElemReadingConfirmation = {
	id: "reading-confirmation",
	iconClass: "glyphicon glyphicon-music",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.reading-confirmation",
	selectable: true
};
export const footerElemTheme = {
	id: "theme",
	iconClass: "glyphicon glyphicon-blackboard",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.theme"
};
export const footerElemImport = {
	id: "import",
	iconClass: "glyphicon glyphicon-import glyphicon-import-style",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.import"
};
export const footerElemFullscreen = {
	id: "fullscreen",
	iconClass: "glyphicon glyphicon-fullscreen",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.fullscreen",
	selectable: true
};
export const footerElemHome = {
	id: "home",
	iconClass: "glyphicon glyphicon-import glyphicon-import-style",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.home"
};
export const footerElemAbout = {
	id: "about",
	iconClass: "glyphicon glyphicon-import glyphicon-import-style",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.about"
};
export const footerElemTos = {
	id: "tos",
	iconClass: "glyphicon glyphicon-import glyphicon-import-style",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.tos"
};
export const footerElemDataPrivacy = {
	id: "data-privacy",
	iconClass: "glyphicon glyphicon-import glyphicon-import-style",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.data_privacy"
};
export const footerElemImprint = {
	id: "imprint",
	iconClass: "glyphicon glyphicon-import glyphicon-import-style",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.imprint"
};
export const footerElemQRCode = {
	id: "qr-code",
	iconClass: "glyphicon glyphicon-qrcode",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.qr_code"
};
const footerElemShowMore = {
	id: "show-more",
	iconClass: "glyphicon glyphicon-menu-hamburger",
	textClass: "footerElementText",
	textName: "region.footer.footer_bar.show_more"
};
const footerElements = [];
const hiddenFooterElements = {
	selectable: [],
	linkable: []
};

export function generateFooterElements() {
	$.merge(footerElements, hiddenFooterElements.selectable);
	$.merge(footerElements, hiddenFooterElements.linkable);
	hiddenFooterElements.selectable.splice(0, hiddenFooterElements.selectable.length);
	hiddenFooterElements.linkable.splice(0, hiddenFooterElements.linkable.length);
	let maxElems = 4;
	if ($(document).width() >= 1200) {
		maxElems = 12;
	} else if ($(document).width() >= 992) {
		maxElems = 6;
	}
	const index = $.inArray(footerElemShowMore, footerElements);
	if (index > 0) {
		footerElements.splice(index, 1);
	}
	if (footerElements.length > maxElems) {
		for (let i = footerElements.length - 1; i >= maxElems - 1; i--) {
			hiddenFooterElements[footerElements[i].selectable ? "selectable" : "linkable"].push(footerElements[i]);
			footerElements.splice(i, 1);
		}
		addFooterElement(footerElemShowMore);
	}
	Session.set("footerElements", footerElements);
	Session.set("hiddenFooterElements", hiddenFooterElements);
	return footerElements;
}

export function addFooterElement(footerElement, priority = 100) {
	footerElements.splice(priority, 0, footerElement);
}

export function removeFooterElements() {
	footerElements.splice(0, footerElements.length);
	hiddenFooterElements.selectable.splice(0, hiddenFooterElements.selectable.length);
	hiddenFooterElements.linkable.splice(0, hiddenFooterElements.linkable.length);
	Session.set("footerElements", footerElements);
	Session.set("hiddenFooterElements", hiddenFooterElements);
}

export function calculateFooterFontSize() {
	let iconSize = "3vh", textSize = "2vh";
	const navbarFooter = $(".navbar-footer");

	if ($(document).width() > $(document).height()) {
		iconSize = "2vw";
		textSize = "1vw";
	}
	$(".footerElementText").css("fontSize", textSize);
	navbarFooter.css({"fontSize": iconSize});
	$('.fixed-bottom').css("bottom", navbarFooter.height());
	$("[name='switch']").bootstrapSwitch({size: "small"});
	return {
		icon: iconSize,
		text: textSize
	}
}

export function calculateFooter() {
	$(window).on("resize", function () {
		generateFooterElements();
		Meteor.setTimeout(calculateFooterFontSize, 40);
	});
	generateFooterElements();
	Meteor.setTimeout(calculateFooterFontSize, 40);
}
