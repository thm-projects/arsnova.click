export const excelDefaultWorksheetOptions = {
	margins: {
		left: 0.75,
		right: 0.75,
		top: 1.0,
		bottom: 1.0,
		footer: 0.5,
		header: 0.5
	},
	printOptions: {
		centerHorizontal: true,
		centerVertical: false
	},
	view: {
		zoom: 100
	},
	outline: {
		summaryBelow: true
	},
	fitToPage: {
		fitToHeight: 100,
		orientation: 'landscape'
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

