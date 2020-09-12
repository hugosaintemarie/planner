import calendars from './calendars';
import data from './data';
import dates from './dates';
import events from './events';
import inputs from './inputs';
import panel from './panel';
import selection from './selection';
import sortable from './sortable';
import stats from './stats';
import templates from './templates';
import tooltip from './tooltip';
import ui from './ui';

$(() => {
    dates.init();
    
    calendars.init();
    data.init();
    events.init();
    inputs.init();
    panel.init();
    selection.init();
    sortable.init();
    stats.init();
    templates.init();
    tooltip.init();
    ui.init();
});