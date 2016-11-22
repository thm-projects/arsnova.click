/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

App.info({
	version: '1.1.5',
	id: 'click.arsnova',
	name: 'ARSnova.click',
	description: 'Quiz-App für alle(s) !',
	email: 'info@arsnova.eu',
	website: 'https://arsnova.click'
});

App.setPreference('Orientation', 'portrait');
App.setPreference('DisallowOverscroll', 'true');

App.icons({
	'iphone': 'public/images/ios/icon_iphone_1x.png',
	'iphone_2x': 'public/images/ios/icon_iphone_2x.png',
	'iphone_3x': 'public/images/ios/icon_iphone_3x.png',
	'ipad': 'public/images/ios/icon_ipad_1x.png',
	'ipad_2x': 'public/images/ios/icon_ipad_2x.png',
	'android_mdpi': 'public/images/android/mdpi/icon-mdpi.png',
	'android_hdpi': 'public/images/android/hdpi/icon-hdpi.png',
	'android_xhdpi': 'public/images/android/xhdpi/icon-xhdpi.png',
	'android_xxhdpi': 'public/images/android/xxhdpi/icon-xxhdpi.png',
	'android_xxxhdpi': 'public/images/android/xxxhdpi/icon-xxxhdpi.png'
});

App.launchScreens({
	'iphone': 'public/images/ios/ls_iphone_portrait_1x.png',
	'iphone_2x': 'public/images/ios/ls_iphone_portrait_2x.png',
	'iphone5': 'public/images/ios/ls_iphone5_portrait_2x.png',
	'iphone6': 'public/images/ios/ls_iphone6_portrait_2x.png',
	'iphone6p_portrait': 'public/images/ios/ls_iphone6p_portrait_3x.png',
	'iphone6p_landscape': 'public/images/ios/ls_iphone6p_landscape_3x.png',
	'ipad_portrait': 'public/images/ios/ls_ipad_portrait_1x.png',
	'ipad_landscape': 'public/images/ios/ls_ipad_landscape_1x.png',
	'ipad_portrait_2x': 'public/images/ios/ls_ipad_portrait_2x.png',
	'ipad_landscape_2x': 'public/images/ios/ls_ipad_landscape_2x.png',
	'android_mdpi_portrait': 'public/images/android/mdpi/ls_mdpi_portrait.png',
	'android_mdpi_landscape': 'public/images/android/mdpi/ls_mdpi_landscape.png',
	'android_hdpi_portrait': 'public/images/android/hdpi/ls_hdpi_portrait.png',
	'android_hdpi_landscape': 'public/images/android/hdpi/ls_hdpi_landscape.png',
	'android_xhdpi_portrait': 'public/images/android/xhdpi/ls_xhdpi_portrait.png',
	'android_xhdpi_landscape': 'public/images/android/xhdpi/ls_xhdpi_landscape.png',
	'android_xxhdpi_portrait': 'public/images/android/xxhdpi/ls_xxhdpi_portrait.png',
	'android_xxhdpi_landscape': 'public/images/android/xxhdpi/ls_xxhdpi_landscape.png',
	'android_xxxhdpi_portrait': 'public/images/android/xxxhdpi/ls_xxxhdpi_portrait.png',
	'android_xxxhdpi_landscape': 'public/images/android/xxxhdpi/ls_xxhdpi_landscape.png'
});
