import calendars from './calendars';
import data from './data';
import dates from './dates';
import categories from './categories';
import inputs from './inputs';
import newEvent from './newEvent';
import panel from './panel';
import selection from './selection';
import sortable from './sortable';
import stats from './stats';
import templates from './templates';
import toast from './toast';
import tooltip from './tooltip';
import ui from './ui';

$(() => {
    dates.init();

    calendars.init();
    data.init();
    categories.init();
    inputs.init();
    newEvent.init();
    panel.init();
    selection.init();
    sortable.init();
    stats.init();
    templates.init();
    toast.init();
    tooltip.init();
    ui.init();
});