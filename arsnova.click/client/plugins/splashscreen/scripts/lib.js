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
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';

/**
 * This class will construct an empty splashscreen which can be modified via JQuery.
 *
 * Since ES6 does not support destructors you'll need to manually call the destroy() method on the splashscreen if you
 * registered any root-level event listeners. You can pass the event removing calls to the onDestroyed option.
 */
export class Splashscreen {
    /**
     * Constructs and returns a new instance of Splashscreen
     * Valid parameters are:
     * - autostart      -> True, if the splashscreen should show on startup
     * - templateName   -> The Meteor Template which is used to display the splashscreen
     * - instanceId     -> If you define multiple splashscreens on one page you'll need to give each of them unique id's
     * - closeOnClick   -> False, if the splashscreen should close on click on the close button
     * - onCreated      -> Callback function which is called when the splashscreen is created
     * - onRendered     -> Callback function which is called when the splashscreen is rendered
     * - onDestroyed    -> Callback function which is called when the splashscreen is destroyed
     *
     * @param options Must be an object with optional parameters
     */
    constructor(options) {
        this.options = {
            autostart:      options.autostart       || false,
            templateName:   options.templateName    || "splashscreen",
            instanceId:     options.instanceId      || 0,
            closeOnButton:  options.closeOnButton   || false,
            onCreated:      options.onCreated       || undefined,
            onDestroyed:    options.onDestroyed     || undefined,
            onRendered:     options.onRendered      || undefined
        };
        this.created();
        this.isCreated = true;
        this.rendered();
        this.isRendered = true;
    }

    /**
     * This method will be called after the options have been parsed by the constructor
     * If a callback to options.onCreated has been specified this method will run the callback
     */
    created() {

        if(typeof this.options.onCreated === "function") {
            this.options.onCreated();
        }
    }

    /**
     * This method will be called after the created method
     * If a callback to options.onRendered has been specified this method will run the callback
     */
    rendered() {
        let template = Template[this.options.templateName];
        if(template) {
            this.templateInstance = Blaze.render(Template[this.options.templateName], document.body);
            $(this.templateInstance.firstNode()).addClass(this.options.templateName).attr("id",this.options.templateName+"_"+this.options.instanceId);
        } else {
            throw new Error('Invalid template name');
        }

        this.isOpen = this.options.autostart;
        if(this.isOpen) {
            this.open();
        } else {
            this.close();
        }

        if(typeof this.options.onRendered === "function") {
            this.options.onRendered();
        }
    }

    /**
     * This method must be called manually
     * If a callback to options.onDestroyed has been specified this method will run the callback
     */
    destroy() {
        Blaze.remove(this.templateInstance);
        $('.modal-backdrop').remove();
        this.templateInstance = null;
        if(typeof this.options.onDestroyed === "function") {
            this.options.onDestroyed();
        }
    }

    /**
     * A call of this method will close (hide) the splashscreen
     */
    close() {
        let thisTemplate = $('#'+this.options.templateName+"_"+this.options.instanceId);

        if( this.options.closeOnButton ) {
            thisTemplate.off('hide.bs.modal').off('click', this.options.closeOnButton);
        }

        thisTemplate.modal("hide");
        $('.modal-backdrop').remove();
        this.isOpen = false;
    }

    /**
     * A call of this method will show (display) the splashscreen
     */
    open() {
        let thisTemplate = $('#'+this.options.templateName+"_"+this.options.instanceId);

        if( this.options.closeOnButton ) {
            let self = this;
            let hasClickedOnCloseButton = false;
            thisTemplate.on('hide.bs.modal',function (event) {
                if( !hasClickedOnCloseButton ) {
                    event.stopPropagation();
                    event.preventDefault();
                }
            }).on('click', this.options.closeOnButton, function () {
                hasClickedOnCloseButton = true;
                self.close();
            });
        }

        thisTemplate.modal("show");
        this.isOpen = true;
    }
}


class ErrorSplashscreen extends Splashscreen {
    constructor(options) {
        super(options);
    }

    setErrorText(text) {
        if(this.isRendered) {
            $(this.templateInstance.firstNode()).find("#errorMessage-text").text(text);
        }
    }
}

export const splashscreen_error = new ErrorSplashscreen({
    autostart: false,
    templateName: "errorSplashscreen",
    closeOnButton: "#js-btn-hideErrorMessageModal"
});