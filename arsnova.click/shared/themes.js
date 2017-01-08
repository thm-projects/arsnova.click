
export const themes = [
	{
		name: "view.theme_switcher.themes.theme-arsnova-dot-click-contrast.name",
		description: "view.theme_switcher.themes.theme-arsnova-dot-click-contrast.description",
		id: "theme-arsnova-dot-click-contrast"
	},
	{
		name: "view.theme_switcher.themes.material.name",
		description: "view.theme_switcher.themes.material.description",
		id: "theme-Material"
	},
	{
		name: "view.theme_switcher.themes.black_beauty.name",
		description: "view.theme_switcher.themes.black_beauty.description",
		id: "theme-blackbeauty"
	},
	{
		name: "view.theme_switcher.themes.elegant.name",
		description: "view.theme_switcher.themes.elegant.description",
		id: "theme-elegant"
	}
];

export function checkIfThemeExist (theme) {
	let themeExists = false;
	$.each(themes, function( index, value ) {
		if (value.id === theme) {
			themeExists = true;
			return false;
		}
	});
	return themeExists;
}
