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

import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {ObserveSequence} from 'meteor/observe-sequence';

function checkOnChangeCallbacks(observerInstance, item, currentPath) {
	observerInstance.onChangeCallbacks[currentPath].forEach(function (callbackObject) {
		if ($.inArray(item.key, callbackObject.limiter) > -1) {
			if (observerInstance.verbose) {
				console.log("EventStackObserver: Found matching event limiter", item.key, "in key map", callbackObject.limiter);
				console.log("EventStackObserver: Calling ", [callbackObject.callback]);
			}
			callbackObject.callback(item.key, item.value);
		}
	});
}

export class EventStackObserver {
	constructor (options) {
		this.observer = null;
		this.onChangeCallbacks = [];
		this.onRemoveCallbacks = [];
		this.ignoreChanges = options.ignoreChanges || ["EventManager.keepalive"];
		this.verbose = options.verbose || false;
		this.running = false;
		this.hooks = {
			after: {
				update: null,
				remove: null
			}
		};
	}

	startObserving () {
		this.stop();
		if (!EventManagerCollection.findOne()) {
			throw new Error("EventManager collection is not ready!");
		}
		const observerInstance = this;
		ObserveSequence.observe(function () {
			return EventManagerCollection.find();
		}, {
			changedAt: function (id,newDocument, oldDocument) {
				for (let i = oldDocument.eventStack.length; i < newDocument.eventStack.length; i++) {
					if (newDocument.eventStack[i] && Router.current().route.getName()) {
						let currentPath = Router.current().route.getName().replace(":quizName.", "");
						if (observerInstance.onChangeCallbacks[currentPath] && observerInstance.onChangeCallbacks[currentPath].length > 0) {
							let item = newDocument.eventStack[i];
							if (observerInstance.verbose) {
								console.log("EventStackObserver: ", item.key, item.value);
								console.log(
									"EventStackObserver: Currently on route: " + currentPath,
									"Number of callbacks: " + observerInstance.onChangeCallbacks[currentPath].length,
									"callbacks: ",observerInstance.onChangeCallbacks[currentPath]
								);
							}
							if ($.inArray(item.key, observerInstance.ignoreChanges) > -1) {
								return;
							}
							checkOnChangeCallbacks(observerInstance, item, currentPath);
							if (observerInstance.verbose) {
								console.log("EventStackObserver: All change callbacks have been called");
								console.log("EventStackObserver: ---------------------------------------------------");
							}
						}
					}
				}
			},
			addedAt: function () {
			},
			removedAt: function () {
			},
			movedTo: function () {
			}
		});
		this.hooks.after.remove = EventManagerCollection.after.remove(function () {
			if (Router.current().route.getName()) {
				let currentPath = Router.current().route.getName().replace(":quizName.", "");
				if (observerInstance.onRemoveCallbacks[currentPath] && observerInstance.onRemoveCallbacks[currentPath].length > 0) {
					if (observerInstance.verbose) {
						console.log("EventStackObserver: Remove event fired");
						console.log(
							"EventStackObserver: Currently on route: " + currentPath,
							"Number of callbacks: " + observerInstance.onRemoveCallbacks[currentPath].length,
							"callbacks: ",observerInstance.onRemoveCallbacks[currentPath]
						);
					}
					observerInstance.onRemoveCallbacks[currentPath].forEach(function (callbackObject) {
						callbackObject();
					});
					observerInstance.stop();
					if (observerInstance.verbose) {
						console.log("EventStackObserver: All remove callbacks have been called");
						console.log("EventStackObserver: ---------------------------------------------------");
					}
				}
			}
		});
		if (observerInstance.verbose) {
			console.log("EventStackObserver: Observer started");
		}
		this.running = true;
	}

	stop () {
		if (this.isRunning()) {
			//this.hooks.after.update.remove();
			this.hooks.after.remove.remove();
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
		let currentPath = Router.current().route.getName().replace(":quizName.", "");
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
			if (this.verbose) {
				console.log("EventObserver: Added callback to route ",currentPath, " via limiter ",limiter, " with callback ",[callback]);
			}
		}
	}

	onRemove (callback) {
		if (typeof callback !== 'function') {
			throw new Error("invalid callback!");
		}
		let currentPath = Router.current().route.getName().replace(":quizName.", "");
		if (!(this.onRemoveCallbacks[currentPath] instanceof Array)) {
			this.onRemoveCallbacks[currentPath] = [];
		}
		let hasCallback = false;
		this.onRemoveCallbacks[currentPath].forEach(function (callbackObject) {
			if (callback.toString() === callbackObject.toString()) {
				hasCallback = true;
			}
		});
		if (!hasCallback) {
			this.onRemoveCallbacks[currentPath].push(callback);
		}
	}

	getAllCallbacks (routeLimiter) {
		return routeLimiter ? this.onChangeCallbacks[routeLimiter] : this.onChangeCallbacks;
	}

	getObserver () {
		return this.observer;
	}
}

export let globalEventStackObserver = null;

export function setGlobalEventStackObserver() {
	if (globalEventStackObserver) {
		globalEventStackObserver.stop();
	}
	globalEventStackObserver = new EventStackObserver({verbose: false});
}
