import { Template } from 'meteor/templating';
import {formatAnswerButtons} from './lib.js';

Template.votingview.onRendered(function () {
    $(window).resize(function () {
        formatAnswerButtons();
    });
    formatAnswerButtons();
});