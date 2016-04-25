

import { EventManager } from '/lib/eventmanager.js';

/*
 var eventManagerIndex = 0;
 EventManager.find().observeChanges({
 changed: function (id, changedFields) {
 if (changedFields.lastConnection) {
 delete changedFields.lastConnection;
 }
 if (changedFields.eventStack) {
 let i = eventManagerIndex;
 for(i; i< changedFields.eventStack.length; i++) {
 let item = changedFields.eventStack[i];
 if(item.key !== "EventManager.keepalive") {
 //console.log("EventStack 1: ", item.key, item.value);
 }
 }
 eventManagerIndex = i;
 }
 }
 });
 */
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
                        observerInstance.onChangeCallbacks[Router.current().route.path()].forEach(function(callback) {
                            if(observerInstance.verbose) {
                                console.log("EventStackObserver: Calling callback ", [callback]);
                            }
                            callback(item.key, item.value);
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

    onChange(callback) {
        if(typeof callback !== 'function') {
            throw new Error("invalid callback!");
        }
        if( !(this.onChangeCallbacks[Router.current().route.path()] instanceof Array )) {
            this.onChangeCallbacks[Router.current().route.path()] = [];
        }
        let hasCallback = false;
        this.onChangeCallbacks[Router.current().route.path()].forEach(function(compareCallback) {
            if(callback.toString() === compareCallback.toString()) {
                hasCallback = true;
            }
        });
        if(!hasCallback) {
            this.onChangeCallbacks[Router.current().route.path()].push(callback);
        }
    }
}

export let globalEventStackObserver = null;

export function setGlobalEventStackObserver() {
    globalEventStackObserver = new EventStackObserver({verbose: false});
}