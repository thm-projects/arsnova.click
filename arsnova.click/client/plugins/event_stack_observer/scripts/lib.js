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

import {EventManager} from '/lib/eventmanager.js';

export class EventStackObserver {
	constructor (options) {
		this.observer = null;
		this.onChangeCallbacks = [];
		this.ignoreChanges = options.ignoreChanges || ["EventManager.keepalive"];
		this.verbose = options.verbose || false;
		this.running = false;
	}

	start (hashtag) {
		this.stop();
		if (!EventManager.findOne({hashtag})) {
			throw new Error("EventManager collection is not ready!");
		}
		const observerInstance = this;
		observerInstance.stackIndex = 0;
		this.observer = EventManager.find({hashtag}).observeChanges({
			changed: function (id, changedFields) {
				if (changedFields.eventStack) {
					let index = changedFields.eventStack.length - 1;
					let currentPath = Router.current().route.path();
					if (observerInstance.onChangeCallbacks[currentPath] && observerInstance.onChangeCallbacks[currentPath].length > 0) {
						let item = changedFields.eventStack[index];
						if ($.inArray(item.key, observerInstance.ignoreChanges) > -1) {
							return;
						}
						if (observerInstance.verbose) {
							console.log("EventStackObserver: ", item.key, item.value);
							console.log(
								"EventStackObserver: Currently on route: " + currentPath,
								"Number of callbacks: " + observerInstance.onChangeCallbacks[currentPath].length,
								"callbacks: ",observerInstance.onChangeCallbacks[currentPath]
							);
						}
						observerInstance.onChangeCallbacks[currentPath].forEach(function (callbackObject) {
							if ($.inArray(item.key, callbackObject.limiter) > -1) {
								if (observerInstance.verbose) {
									console.log("EventStackObserver: Found matching event limiter", item.key, "in key map", callbackObject.limiter);
									console.log("EventStackObserver: Calling ", [callbackObject.callback]);
								}
								callbackObject.callback(item.key, item.value);
							}
						});
						if (observerInstance.verbose) {
							console.log("EventStackObserver: All callbacks have been called");
							console.log("EventStackObserver: ---------------------------------------------------");
						}
					}
				}
			}
		});
		if (observerInstance.verbose) {
			console.log("EventStackObserver: Observer started: ", this.observer);
		}
		this.running = true;
	}

	stop () {
		if (this.observer) {
			this.observer.stop();
			this.running = false;
		}
	}

	isRunning () {
		return this.running;
	}

	onChange (limiter, callback) {
		if (!(limiter instanceof Array)) {
			throw new Error("Limiter must be an Array!");
		}
		if (typeof callback !== 'function') {
			throw new Error("invalid callback!");
		}
		let currentPath = Router.current().route.path();
		if (!(this.onChangeCallbacks[currentPath] instanceof Array)) {
			this.onChangeCallbacks[currentPath] = [];
		}
		let hasCallback = false;
		this.onChangeCallbacks[currentPath].forEach(function (callbackObject) {
			if (callback.toString() === callbackObject.callback.toString()) {
				hasCallback = true;
			}
		});
		if (!hasCallback) {
			this.onChangeCallbacks[currentPath].push({
				limiter,
				callback
			});
		}
	}
}

export let globalEventStackObserver = null;

export function setGlobalEventStackObserver() {
	if (globalEventStackObserver) {
		globalEventStackObserver.stop();
	}
	globalEventStackObserver = new EventStackObserver({verbose: true});
}
