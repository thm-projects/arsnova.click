
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
	},
	{
		name: "view.theme_switcher.themes.decent_blue.name",
		description: "view.theme_switcher.themes.decent_blue.description",
		id: "theme-decent-blue"
	},
	{
		name: "view.theme_switcher.themes.material_hope.name",
		description: "view.theme_switcher.themes.material_hope.description",
		id: "theme-Material-hope"
	},
  {
    name: "view.theme_switcher.themes.material-blue.name",
    description: "view.theme_switcher.themes.material-blue.description",
    id: "theme-Material-blue"
  },
  {
    name: "view.theme_switcher.themes.spiritual-purple.name",
    description: "view.theme_switcher.themes.spiritual-purple.description",
    id: "theme-spiritual-purple"
  }
];

export function checkIfThemeExist(theme) {
	let themeExists = false;
	$.each(themes, function (index, value) {
		if (value.id === theme) {
			themeExists = true;
			return false;
		}
	});
	return themeExists;
}
