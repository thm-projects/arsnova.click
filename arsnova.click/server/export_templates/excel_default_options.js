export const excelDefaultWorksheetOptions = {
	margins: {
		/* Values in inches */
		left: 0.4,    // 1cm
		right: 0.4,   // 1cm
		top: 0.79,    // 2cm
		bottom: 0.79, // 2cm
		footer: 0.4,  // 1cm
		header: 0.4   // 1cm
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
		useFirstPageNumber: false,
		usePrinterDefaults: true,
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
