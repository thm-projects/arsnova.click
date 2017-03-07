import {Meteor} from 'meteor/meteor';

const themeData = {
	"theme-arsnova-dot-click-contrast": {
		quizNameRowStyle: {
			fg: "#FFFFFF",
			bg: "#23425b"
		},
		exportedAtRowStyle: {
			fg: "#FFFFFF",
			bg: "#23425b"
		},
		statisticsRowStyle: {
			fg: "#FFFFFF",
			bg: "#424242"
		},
		attendeeHeaderGroupRowStyle: {
			fg: "#FFFFFF",
			bg: "#814E33"
		},
		attendeeHeaderRowStyle: {
			fg: "#FFFFFF",
			bg: "#562b81"
		},
		attendeeEntryRowStyle: {
			fg: "#FFFFFF",
			bg: "#424242"
		}
	},
	"theme-blackbeauty": {
		quizNameRowStyle: {
			fg: "#FFFFFF",
			bg: "#010101"
		},
		exportedAtRowStyle: {
			fg: "#FFFFFF",
			bg: "#010101"
		},
		statisticsRowStyle: {
			fg: "#FFFFFF",
			bg: "#444444"
		},
		attendeeHeaderGroupRowStyle: {
			fg: "#FFFFFF",
			bg: "#010101"
		},
		attendeeHeaderRowStyle: {
			fg: "#FFFFFF",
			bg: "#6b6b6b"
		},
		attendeeEntryRowStyle: {
			fg: "#FFFFFF",
			bg: "#444444"
		}
	},
	"theme-decent-blue": {
		quizNameRowStyle: {
			fg: "#FFFFFF",
			bg: "#455A64"
		},
		exportedAtRowStyle: {
			fg: "#FFFFFF",
			bg: "#455A64"
		},
		statisticsRowStyle: {
			fg: "#FFFFFF",
			bg: "#90A4AE"
		},
		attendeeHeaderGroupRowStyle: {
			fg: "#FFFFFF",
			bg: "#607D8B"
		},
		attendeeHeaderRowStyle: {
			fg: "#000000",
			bg: "#00C853"
		},
		attendeeEntryRowStyle: {
			fg: "#FFFFFF",
			bg: "#90A4AE"
		}
	},
	"theme-elegant": {
		quizNameRowStyle: {
			fg: "#FFFFFF",
			bg: "#002d47"
		},
		exportedAtRowStyle: {
			fg: "#FFFFFF",
			bg: "#002d47"
		},
		statisticsRowStyle: {
			fg: "#000000",
			bg: "#dbe4e9"
		},
		attendeeHeaderGroupRowStyle: {
			fg: "#000000",
			bg: "#B1C5D0"
		},
		attendeeHeaderRowStyle: {
			fg: "#FFFFFF",
			bg: "#374e5b"
		},
		attendeeEntryRowStyle: {
			fg: "#000000",
			bg: "#dbe4e9"
		}
	},
	"theme-GreyBlue-Lime": {
		quizNameRowStyle: {
			fg: "#FFFFFF",
			bg: "#455a64"
		},
		exportedAtRowStyle: {
			fg: "#FFFFFF",
			bg: "#455a64"
		},
		statisticsRowStyle: {
			fg: "#000000",
			bg: "#cfd8dc"
		},
		attendeeHeaderGroupRowStyle: {
			fg: "#FFFFFF",
			bg: "#607d8b"
		},
		attendeeHeaderRowStyle: {
			fg: "#000000",
			bg: "#c0ca33"
		},
		attendeeEntryRowStyle: {
			fg: "#000000",
			bg: "#cfd8dc"
		}
	},
	"theme-Material": {
		quizNameRowStyle: {
			fg: "#FFFFFF",
			bg: "#00796B"
		},
		exportedAtRowStyle: {
			fg: "#FFFFFF",
			bg: "#00796B"
		},
		statisticsRowStyle: {
			fg: "#000000",
			bg: "#B2DFDB"
		},
		attendeeHeaderGroupRowStyle: {
			fg: "#FFFFFF",
			bg: "#009688"
		},
		attendeeHeaderRowStyle: {
			fg: "#000000",
			bg: "#FF9800"
		},
		attendeeEntryRowStyle: {
			fg: "#000000",
			bg: "#B2DFDB"
		}
	},
	"theme-Material-blue": {
		quizNameRowStyle: {
			fg: "#FFFFFF",
			bg: "#303F9F"
		},
		exportedAtRowStyle: {
			fg: "#FFFFFF",
			bg: "#303F9F"
		},
		statisticsRowStyle: {
			fg: "#000000",
			bg: "#C5CAE9"
		},
		attendeeHeaderGroupRowStyle: {
			fg: "#FFFFFF",
			bg: "#3F51B5"
		},
		attendeeHeaderRowStyle: {
			fg: "#000000",
			bg: "#4CAF50"
		},
		attendeeEntryRowStyle: {
			fg: "#000000",
			bg: "#C5CAE9"
		}
	},
	"theme-Material-hope": {
		quizNameRowStyle: {
			fg: "#FFFFFF",
			bg: "#689F38"
		},
		exportedAtRowStyle: {
			fg: "#FFFFFF",
			bg: "#689F38"
		},
		statisticsRowStyle: {
			fg: "#000000",
			bg: "#AED581"
		},
		attendeeHeaderGroupRowStyle: {
			fg: "#FFFFFF",
			bg: "#8BC34A"
		},
		attendeeHeaderRowStyle: {
			fg: "#000000",
			bg: "#FFC400"
		},
		attendeeEntryRowStyle: {
			fg: "#000000",
			bg: "#AED581"
		}
	},
	"theme-Material-purple": {
		quizNameRowStyle: {
			fg: "#FFFFFF",
			bg: "#512da8"
		},
		exportedAtRowStyle: {
			fg: "#FFFFFF",
			bg: "#512da8"
		},
		statisticsRowStyle: {
			fg: "#FFFFFF",
			bg: "#9575cd"
		},
		attendeeHeaderGroupRowStyle: {
			fg: "#FFFFFF",
			bg: "#673ab7"
		},
		attendeeHeaderRowStyle: {
			fg: "#000000",
			bg: "#00bcd4"
		},
		attendeeEntryRowStyle: {
			fg: "#FFFFFF",
			bg: "#9575cd"
		}
	}
};

const selectedTheme = Symbol("ExcelTheme");

export class ExcelTheme {
	constructor (theme) {
		if (!theme) {
			theme = Meteor.settings.public.default.theme;
		}
		this[selectedTheme] = theme;
	}

	getStyles () {
		return {
			quizNameRowStyle: {
				alignment: {
					vertical: "center"
				},
				font: {
					color: themeData[this[selectedTheme]].quizNameRowStyle.fg
				},
				fill: {
					type: "pattern",
					patternType: "solid",
					fgColor: themeData[this[selectedTheme]].quizNameRowStyle.bg
				}
			},
			exportedAtRowStyle: {
				font: {
					color: themeData[this[selectedTheme]].exportedAtRowStyle.fg
				},
				fill: {
					type: "pattern",
					patternType: "solid",
					fgColor: themeData[this[selectedTheme]].exportedAtRowStyle.bg
				}
			},
			questionCellStyle: {
				alignment: {
					wrapText: true,
					vertical: "top"
				}
			},
			statisticsRowStyle: {
				font: {
					color: themeData[this[selectedTheme]].statisticsRowStyle.fg
				},
				fill: {
					type: "pattern",
					patternType: "solid",
					fgColor: themeData[this[selectedTheme]].statisticsRowStyle.bg
				}
			},
			statisticsRowInnerStyle: {},
			attendeeHeaderGroupRowStyle: {
				font: {
					bold: true,
					color: themeData[this[selectedTheme]].attendeeHeaderGroupRowStyle.fg
				},
				fill: {
					type: "pattern",
					patternType: "solid",
					fgColor: themeData[this[selectedTheme]].attendeeHeaderGroupRowStyle.bg
				}
			},
			attendeeHeaderRowStyle: {
				alignment: {
					wrapText: true,
					horizontal: "center",
					vertical: "center"
				},
				font: {
					color: themeData[this[selectedTheme]].attendeeHeaderRowStyle.fg
				},
				fill: {
					type: "pattern",
					patternType: "solid",
					fgColor: themeData[this[selectedTheme]].attendeeHeaderRowStyle.bg
				}
			},
			attendeeEntryRowStyle: {
				font: {
					color: themeData[this[selectedTheme]].attendeeEntryRowStyle.fg
				},
				fill: {
					type: "pattern",
					patternType: "solid",
					fgColor: themeData[this[selectedTheme]].attendeeEntryRowStyle.bg
				}
			}
		};
	}
}
