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

let pendingAnimationRunning = false;
const standardAnimationDelay = 200;
const standardFadeInAnimationTime = 150;
const timeoutHolder = [];

function runPendingAnimation() {
	if (!pendingAnimationRunning) {
		return;
	}
	$('#secondRow, #thirdRow, #fourthRow').hide();
	timeoutHolder.push(setTimeout(function () {
		$('#secondRow').fadeIn(standardFadeInAnimationTime);
		timeoutHolder.push(setTimeout(function () {
			$('#thirdRow').fadeIn(standardFadeInAnimationTime);
			timeoutHolder.push(setTimeout(function () {
				$('#fourthRow').fadeIn(standardFadeInAnimationTime);
				timeoutHolder.push(setTimeout(function () {
					runPendingAnimation();
				}, standardAnimationDelay));
			}, standardAnimationDelay));
		}, standardAnimationDelay));
	}, standardAnimationDelay));
}

export function startPendingAnimation() {
	if (pendingAnimationRunning) {
		return;
	}
	pendingAnimationRunning = true;
	runPendingAnimation();
}

export function stopPendingAnimation() {
	if (!pendingAnimationRunning) {
		return;
	}
	pendingAnimationRunning = false;
	for (let i = 0; i < timeoutHolder.length; i++) {
		clearTimeout(timeoutHolder[i]);
	}
	$('#secondRow, #thirdRow, #fourthRow').show();
}
