import calendars from './calendars';
import events from './events';
import inputs from './inputs';
import selection from './selection';
import sortable from './sortable';

$(document).ready(() => {
    calendars.init();
    events.init();
    inputs.init();
    selection.init();
    sortable.init();
});