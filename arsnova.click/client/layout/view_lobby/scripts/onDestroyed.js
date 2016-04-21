import {memberlistObserver} from './lib.js';

Template.memberlist.onDestroyed(function () {
    memberlistObserver.stop();
});