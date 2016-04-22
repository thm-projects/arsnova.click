import { Template } from 'meteor/templating';
import { calculateButtonCount } from './lib.js';

Template.leaderBoard.onRendered(function () {
    calculateButtonCount();
    
    $(window).resize(calculateButtonCount);
});