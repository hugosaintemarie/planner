import calendars from './calendars';
import events from './events';
import inputs from './inputs';
import panel from './panel';
import selection from './selection';
import sortable from './sortable';

$(document).ready(() => {
    calendars.init();
    events.init();
    inputs.init();
    panel.init();
    selection.init();
    sortable.init();
});