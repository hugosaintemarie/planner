import calendars from './calendars';
import data from './data';
import dates from './dates';
import selection from './selection';

export default {
    view: 'full',
    tool: 'select',

    init() {
        $(document).on('click', 'header nav>ul>li', e => {
            const $el = $(e.currentTarget);
            $el.siblings('.open').removeClass('open');
            $el.toggleClass('open');

            return false;
        });

        $(document).on('mouseenter', 'header nav>ul>li', e => {
            const $el = $(e.currentTarget);
            if ($el.siblings('.open').length) {
                $('header ul li.open').removeClass('open');
                $el.toggleClass('open');
            }

            return false;
        });

        $(document).on('click', 'header nav>ul>li li:not(.disabled)', e => {
            const $target = $(e.currentTarget);
            if ($target.attr('data-checkable') === '') {
                if ($target.attr('data-radio')) this.onRadioChange($target);
                else $target.toggleClass('checked');
            }

            return false;
        });

        $(document).on('click', '', e => {
            $('header ul li.open').removeClass('open');
        });

        // Keep scroll in sync in linear mode
        $(document).on('mousewheel', '.calendar-wrap, .col-left', e => {
            if (this.viewIs('full')) return;
            const scroll = e.currentTarget.scrollTop;
            $('.calendar-wrap, .col-left').scrollTop(scroll);
        });

        // Change tool
        $(document).on('click', 'header .tool', e => {
            this.changeTool($(e.currentTarget).attr('data-tool'));
        });
    },

    onRadioChange($target) {
        const radio = $target.attr('data-radio');
        $(`nav [data-radio="${radio}"]`).removeClass('checked');
        $target.addClass('checked');

        if (radio === 'view') {
            const view = $target.attr('data-value');
            if (view === 'full') this.fullView()
            else if (view === 'linear') this.linearView();
        }
    },

    fullView() {
        this.view = 'full';

        // Update UI
        $('main').removeClass('linear');

        // Update timeline
        $('.calendar-wrap .head').html(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div>${d}</div>`).join(''));

        // Keep only one calendar
        $('.calendar-wrap .calendar').eq(1).empty();
        $('.calendar-wrap .calendar').slice(1).remove();

        // Select current calendar
        const $selectedCalendar = $('.calendars-wrap .calendar.selected');
        calendars.selectCalendar($selectedCalendar);

        // Update height
        calendars.updateCalendarHeight();

        // Check option in menu (when switched from shorcut)
        $(`nav [data-radio="view"]`).removeClass('checked');
        $(`nav [data-radio="view"][data-value="full"]`).addClass('checked');
    },

    linearView() {
        this.view = 'linear';

        // Store .selected-first and .selected-last dates
        const selectedFirst = $('.selected-first').attr('data-date');
        const selectedLast = $('.selected-last').attr('data-date');

        // Update UI
        $('main').addClass('linear');

        // Create range from first day to end
        const days = dates.range(calendars.start, calendars.end);

        // Update timeline
        $('.calendar-wrap .head').html(days.map(day => `<div>${day.toLocaleDateString('en-US', { weekday: 'short' })} ${day.getDate()} ${day.toLocaleDateString('en-US', { month: 'short' })}</div>`));

        // Duplicate every minical
        $('.calendar-wrap .calendar').remove();
        $('.calendars-wrap .calendar').each((id, el) => {
            const $el = $(el);
            const content = $el.find('.content').html();
            $('.calendar-wrap').append(`<div class="content calendar" data-id="${$el.attr('data-id')}">${content}</div>`);
        });

        // Select current calendar and restore .selected-first and .selected-last classes
        const $selectedCalendar = $('.calendars-wrap .calendar.selected');
        calendars.selectCalendar($selectedCalendar, selectedFirst, selectedLast);

        // Update height
        calendars.updateCalendarHeight();

        // Check option in menu (when switched from shorcut)
        $(`nav [data-radio="view"]`).removeClass('checked');
        $(`nav [data-radio="view"][data-value="linear"]`).addClass('checked');
    },

    viewIs(view) {
        return this.view === view;
    },

    changeTool(tool) {
        this.tool = tool;

        // Update UI
        $('header .tool.selected').removeClass('selected');
        $(`header .tool[data-tool="${tool}"]`).addClass('selected');

        // Update cursor on main calendar
        $('.calendar-wrap').removeClass('select draw').addClass(tool);

        // Remove selection when entering draw mode
        if (tool === 'draw') {
            selection.selectedDays = [];
            selection.highlightSelection();
        }

        data.save();
    }
}