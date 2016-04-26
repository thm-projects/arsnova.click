

import { EventManager } from '/lib/eventmanager.js';

export class EventStackObserver {
    constructor(options) {
        this.observer = null;
        this.stackIndex = 0;
        this.onChangeCallbacks = [];
        this.ignoreChanges = options.ignoreChanges || ["EventManager.keepalive"];
        this.verbose = options.verbose || false;
        this.running = false;
    }

    start(hashtag) {
        this.stop();
        if(!EventManager.findOne({hashtag})) {
            throw new Error("EventManager collection is not ready!");
        }
        const observerInstance = this;
        observerInstance.stackIndex = 0;
        this.observer = EventManager.find({hashtag}).observeChanges({
            changed: function (id, changedFields) {
                if (changedFields.eventStack) {
                    let index = changedFields.eventStack.length - 1;
                    if(observerInstance.verbose) {
                        console.log(index,changedFields.eventStack);
                        console.log("EventStackObserver: changed ", changedFields.eventStack[index].key, changedFields.eventStack[index].value);
                    }
                    if(observerInstance.onChangeCallbacks[Router.current().route.path()] && observerInstance.onChangeCallbacks[Router.current().route.path()].length > 0) {
                        let item = changedFields.eventStack[index];
                        if($.inArray(item.key, observerInstance.ignoreChanges) > -1) {
                            return;
                        }
                        if(observerInstance.verbose) {
                            console.log("EventStackObserver: ", item.key, item.value);
                            console.log("currently on route: "+Router.current().route.path(), "Number of callbacks: "+observerInstance.onChangeCallbacks[Router.current().route.path()].length, "callbacks: ",[observerInstance.onChangeCallbacks[Router.current().route.path()]]);
                        }
                        observerInstance.onChangeCallbacks[Router.current().route.path()].forEach(function (callbackObject) {
                            if ($.inArray(item.key, callbackObject.limiter) > -1) {
                                if (observerInstance.verbose) {
                                    console.log("EventStackObserver: Event received ", item.key, " key map ", callbackObject.limiter, " Calling ", [callbackObject.callback]);
                                }
                                callbackObject.callback(item.key, item.value);
                            }
                        });
                    }
                }
            }
        });
        if(observerInstance.verbose) {
            console.log("EventStackObserver: Observer started: ", this.observer);
        }
        this.running = true;
    }

    stop() {
        if(this.observer) {
            this.observer.stop();
            this.running = false;
        }
    }

    isRunning() {
        return this.running;
    }

    onChange (limiter, callback) {
        if (!(limiter instanceof Array)) {
            throw new Error("Limiter must be an Array!");
        }
        if(typeof callback !== 'function') {
            throw new Error("invalid callback!");
        }
        if( !(this.onChangeCallbacks[Router.current().route.path()] instanceof Array )) {
            this.onChangeCallbacks[Router.current().route.path()] = [];
        }
        let hasCallback = false;
        this.onChangeCallbacks[Router.current().route.path()].forEach(function (callbackObject) {
            if (callback.toString() === callbackObject.callback.toString()) {
                hasCallback = true;
            }
        });
        if(!hasCallback) {
            this.onChangeCallbacks[Router.current().route.path()].push({
                limiter,
                callback
            });
        }
    }
}

export let globalEventStackObserver = null;

export function setGlobalEventStackObserver() {
    globalEventStackObserver = new EventStackObserver({verbose: false});
}