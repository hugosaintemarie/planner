import calendars from './calendars';
import data from './data';
import dates from './dates';
import history from './history';
import selection from './selection';

export default {
    view: 'full',
    tool: 'select',
    daysShown: [true, true, true, true, true, true, true],

    init() {
        $(document).on('click', 'header nav > ul > li', e => {
            const $el = $(e.currentTarget);
            $el.siblings('.open').removeClass('open');
            $el.toggleClass('open');

            return false;
        });

        $(document).on('mouseenter', 'header nav > ul > li', e => {
            const $el = $(e.currentTarget);
            if ($el.siblings('.open').length) {
                $('header ul li.open').removeClass('open');
                $el.toggleClass('open');
            }

            return false;
        });

        $(document).on('click', 'header nav li:not(.disabled)', e => {
            const $target = $(e.currentTarget);

            if ($target.attr('data-checkable') === '') {
                if ($target.attr('data-radio')) this.onRadioChange($target);
                else this.check($target);
            } else if ($target.attr('data-tool')) {
                const tool = $target.attr('data-tool');
                if (tool === 'undo') history.undo();
                else if (tool === 'redo') history.redo();
                else if (tool === 'cut') selection.cutSelection();
                else if (tool === 'copy') selection.copySelection();
                else if (tool === 'paste') selection.pasteSelection();
                else if (tool === 'select-all') {
                    selection.selectAll();
                    $('nav li.open').removeClass('open');
                }
                else if (tool === 'edit-all') {
                    $target.toggleClass('checked');
                    $('.calendars-wrap').toggleClass('edit-all');
                }
            }

            return false;
        });

        $(document).on('click', '', e => {
            $('header ul li.open').removeClass('open');
        });

        // Scroll in linear mode
        $(document).on('mousewheel', '.calendar-wrap .calendars, .col-left', e => {
            if (this.viewIs('full')) return;

            // Keep scroll in sync
            const scrollTop = e.currentTarget.scrollTop;
            $('.calendar-wrap .calendars, .col-left').scrollTop(scrollTop);
            
            // Keep (visible) event titles in view
            $('.calendar-wrap .event .title:visible').each((_, el) => {
                const $title = $(el);
                const $event = $title.closest('.event');
                const id = $event.attr('data-id');
                const $events = $(`.calendar-wrap .event[data-id="${id}"]`);

                // Ignore one-day events
                if ($events.length === 1) return;

                // Total event width (add up single .events widths)
                const width = $events.toArray().reduce((acc, curr) => acc + curr.offsetWidth, 0);
                
                const eventOffsetLeft = $event.offset().left;
                const eventOffsetRight = eventOffsetLeft + width;
                const colWidth = $(window).width() <= 1120 ? 24 : 240;
                
                if (eventOffsetLeft < colWidth && eventOffsetRight > colWidth) {
                    const top = $event.offset().top + 2;

                    // Make title stick to left border or right end of event
                    const left = Math.min(Math.ceil(eventOffsetRight - $title.outerWidth() - (colWidth + 14)), 0) + colWidth + 6;

                    $title.css({
                        'position': 'fixed',
                        'top': top,
                        'left': left
                    });
                } else {
                    $title.css({
                        'position': '',
                        'top': '',
                        'left': ''
                    });
                }
            })
        });

        // Change tool
        $(document).on('click', 'header .tool', e => {
            this.changeTool($(e.currentTarget).attr('data-tool'));
        });

        // Click on day in timeline
        $(document).on('click', '.head [data-day]', e => {
            $('.head [data-day].open').removeClass('open');
            $('.dropdown').removeClass('visible');

            const $el = $(e.currentTarget);
            $el.addClass('open');
            $el.find('.dropdown').addClass('visible');
            return false;
        });

        // Hide day column
        $(document).on('click', '[data-tool="hide-weekday"]', e => {
            const $el = $(e.currentTarget);
            const day = $el.closest('[data-day]').attr('data-day');
            this.showHideWeekday(day, false);
        });
    },

    check($target) {
        const setting = $target.attr('data-setting');
        const value = $target.attr('data-value');
        const checked = $target.hasClass('checked');

        if (setting === 'show-weekday') this.showHideWeekday(value, !checked);
        else $target.toggleClass('checked');
    },

    onRadioChange($target) {
        const radio = $target.attr('data-radio');
        $(`nav [data-radio="${radio}"]`).removeClass('checked');
        $target.addClass('checked');

        if (radio === 'view') {
            const view = $target.attr('data-value');
            if (view === 'full') this.fullView()
            else if (view === 'linear') this.linearView();
            data.save();
        }
    },

    fullView() {
        this.view = 'full';

        // Update UI
        $('main').removeClass('linear');

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

        // Duplicate every minical
        $('.calendar-wrap .calendar').remove();
        $('.calendars-wrap .calendar').each((_, el) => {
            const $el = $(el);
            const content = $el.find('.content').html();
            $('.calendar-wrap .calendars').append(`<div class="content calendar ${$el.hasClass('hidden') ? 'hidden' : ''}" data-id="${$el.attr('data-id')}">${content}</div>`);
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

        // Update header UI
        $('header .tool.selected').removeClass('selected');
        $(`header .tool[data-tool="${tool}"]`).addClass('selected');

        // Update main calendar UI
        $('.calendar-wrap').removeClass('select draw').addClass(tool);

        // Remove selection when entering draw mode
        if (tool === 'draw') {
            selection.selectedDays = [];
            selection.highlightSelection();
        }

        data.save();
    },

    toolIs(tool) {
        return this.tool === tool;
    },

    showHideWeekday(day, show) {
        const $day = $(`[data-day=${day}]`);
        const $li = $(`nav [data-setting="show-weekday"][data-value="${day}"]`);
        if (show) {
            $day.show();
            $li.addClass('checked');
        } else {
            $day.hide();
            $li.removeClass('checked');
        }

        this.daysShown[day] = show;
        data.save();
    }
}