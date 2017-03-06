export const excelDefaultWorksheetOptions = {
	margins: {
		left: 0.4,    // 1cm
		right: 0.4,   // 1cm
		top: 0.59,    // 1.5cm
		bottom: 0.59, // 1.5cm
		footer: 0,
		header: 0
	},
	headerFooter: {
		firstFooter: "",
		firstHeader: "",
		alignWithMargins: true,
		differentFirst: false,
		differentOddEven: false,
		scaleWithDoc: false
	},
	printOptions: {
		centerHorizontal: false,
		centerVertical: false,
		printGridLines: false,
		printHeadings: false
	},
	pageSetup: {
		errors: "displayed",
		fitToHeight: 1,
		fitToWidth: 1,
		orientation: 'landscape',
		paperSize: "A4_PAPER",
		scale: 100
	}
};

export const excelDefaultWorksheetValidationData = {
	type: "list",
	allowBlank: 1,
	showInputMessage: 1,
	showErrorMessage: 1,
	sqref: "X2:X10",
	formulas: [
		'value1,value2'
	]
};
