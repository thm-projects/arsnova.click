
import {Template} from 'meteor/templating';
import * as headerLib from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";

Template.questionTypeView.onRendered(function () {
	footerElements.removeFooterElements();
	footerElements.addFooterElement(footerElements.footerElemHome);
	footerElements.addFooterElement(footerElements.footerElemNicknames);
	headerLib.calculateHeaderSize();
	headerLib.calculateTitelHeight();
})
