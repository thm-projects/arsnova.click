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

export class EventStackObserver {
	constructor (options) {
		this.observer = null;
		this.onChangeCallbacks = [];
		this.onRemoveCallbacks = [];
		this.ignoreChanges = options.ignoreChanges || ["EventManager.keepalive"];
		this.verbose = options.verbose || false;
		this.running = false;
	}

	startObserving () {
		this.stop();
		if (!EventManagerCollection.findOne()) {
			throw new Error("EventManager collection is not ready!");
		}
		const observerInstance = this;
		EventManagerCollection.hookOptions.after.update = {fetchPrevious: false};
		/*
		this.observer = EventManagerCollection.find().observeChanges({
			changed: function (id, changedFields) {
				if (changedFields.eventStack && Router.current().route.getName()) {
					let index = changedFields.eventStack.length - 1;
					let currentPath = Router.current().route.getName().replace(":quizName.", "");
					if (observerInstance.onChangeCallbacks[currentPath] && observerInstance.onChangeCallbacks[currentPath].length > 0) {
						let item = changedFields.eventStack[index];
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
							console.log("EventStackObserver: All change callbacks have been called");
							console.log("EventStackObserver: ---------------------------------------------------");
						}
					}
				}
			}
		});
		*/
		EventManagerCollection.after.update(function (userId, doc, fieldNames, modifier) {
			EVTCOL = EventManagerCollection.find().fetch();
			let changedFields = modifier.$push || modifier.$set;
			if (changedFields.eventStack && Router.current().route.getName()) {
				console.log(modifier);
				let currentPath = Router.current().route.getName().replace(":quizName.", "");
				if (observerInstance.onChangeCallbacks[currentPath] && observerInstance.onChangeCallbacks[currentPath].length > 0) {
					let item = changedFields.eventStack;
					if (observerInstance.verbose) {
						console.log("EventStackObserver: Change event fired");
						console.log("EventStackObserver: ", item.key, item.value);
						console.log(
							"EventStackObserver: Currently on route: " + currentPath,
							"Number of callbacks: " + observerInstance.onChangeCallbacks[currentPath].length,
							"callbacks: ",observerInstance.onChangeCallbacks[currentPath]
						);
					}
					/*
					if ($.inArray(item.key, observerInstance.ignoreChanges) > -1) {
						return;
					}*/
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
						console.log("EventStackObserver: All change callbacks have been called");
						console.log("EventStackObserver: ---------------------------------------------------");
					}
				}
			}
		});
		EventManagerCollection.after.remove(function () {
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
			console.log("EventObserver: Added callback to route ",currentPath, " via limiter ",limiter, " with callback ",[callback]);
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
	globalEventStackObserver = new EventStackObserver({verbose: true});
}
