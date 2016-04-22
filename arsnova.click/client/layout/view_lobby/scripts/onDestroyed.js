import { Template } from 'meteor/templating';
import { memberlistObserver } from './lib.js';

Template.memberlist.onDestroyed(function () {
    if(memberlistObserver) {
        memberlistObserver.stop();
    }
});