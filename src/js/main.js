import calendars from './calendars';
import events from './events';
import inputs from './inputs';
import panel from './panel';
import selection from './selection';
import sortable from './sortable';
import stats from './stats';
import ui from './ui';

$(document).ready(() => {
    calendars.init();
    events.init();
    inputs.init();
    panel.init();
    selection.init();
    sortable.init();
    stats.init();
    ui.init();
});