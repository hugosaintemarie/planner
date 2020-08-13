import calendars from './calendars';
import data from './data';
import dates from './dates';
import selection from './selection';
import stats from './stats';
import ui from './ui';

export default {
    data: [],
    calendarID: 0,
    start: null,
    end: null,

    init() {
        // Update calendars start and end
        $(document).on('change', '#start, #end', () => {
            this.getStartEnd();
            const calendar = this.buildCalendar();

            $('.calendar-wrap .content').html(calendar);
            $('.calendars-wrap .calendar .content').html(calendar);
        });

        // Switch calendar
        $(document).on('click', '.calendars-wrap .calendar:not(.selected)', e => {
            const $calendar = $(e.target).closest('.calendar');
            calendars.selectCalendar($calendar);
        });

        // Add new calendar
        $(document).on('click', '.calendars-wrap .add', () => {
            calendars.newCalendar();
        });

        // Rename calendar in sidebar
        $(document).on('input', '.calendars-wrap p span', e => {
            const $calendar = $(e.target).closest('.calendar');
            const val = $(e.target).text();
            calendars.renameCalendar(val, $calendar);
        });

        // Rename selected calendar
        $(document).on('input', '.calendar-wrap h2', e => {
            const val = $(e.target).text();
            calendars.renameCalendar(val);
        });

        // Toggle calendar visibility
        $(document).on('click', '.calendars-wrap [data-tool="toggle"]', e => {
            const $calendar = $(e.target).closest('.calendar');
            calendars.toggleCalendar($calendar);
            return false;
        });

        // Duplicate calendar
        $(document).on('click', '.calendar .tools [data-tool="duplicate"]', e => {
            const $calendar = $(e.target).closest('.calendar')
            calendars.duplicateCalendar($calendar);
            return false;
        });

        // Delete calendar
        $(document).on('click', '.calendar .tools [data-tool="delete"]', e => {
            const $calendar = $(e.target).closest('.calendar');
            calendars.deleteCalendar($calendar);
            return false;
        });

        // Toggle edit all
        $(document).on('click', '.toggle-edit-all', () => {
            $('.calendars-wrap').toggleClass('edit-all');
        });
    },

    // Get start and end dates
    getStartEnd() {
        this.start = new Date(new Date($('#start').val()).setHours(0));
        this.end = new Date(new Date($('#end').val()).setHours(0));
    },
    
    buildCalendar() {
        const start = this.start;
        const end = this.end;
        if (end < start) return;
    
        // Find first week day
        const first = dates.relativeFirstWeekDay(start);

        // Create range from first day to end
        const days = dates.range(first, end);
    
        // Fill last week
        while (days.length % 7 !== 0) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));
    
        // Build HTML
        let html = '<div>';
        for (const day of days) {
            const date = dates.toString(day);
            day.setHours(0);

            // Show day cell as out of bounds if necessary
            const classname = day < start || day > end ? ' out' : '';
    
            html += `<div class="day${classname}" data-date="${date}"><span>${day.getDate()} ${day.toLocaleDateString('en-US', { month: 'short' })}</span><div class="events"></div></div>`;
    
            if (day.getDay() === 0) html += '</div><div>';
        }
        html += '</div>';
    
        return html;
    },

    newCalendar(calendar) {
        const id = calendar ? calendar.id : this.calendarID++;
        const title = calendar ? calendar.title : `Calendar ${$('.calendars-wrap .calendar').length + 1}`;

        // Create HTML
        const html = `<div class="calendar sortable" data-id="${id}">
            <div class="tools">
                <i data-tool="toggle" class="far fa-eye"></i>
                <i data-tool="sort">⋮⋮</i>
                <i data-tool="duplicate" class="far fa-clone"></i>
                <i data-tool="delete" class="far fa-trash-alt"></i>
            </div>
            <div class="content">${ this.buildCalendar() }</div>
            <p><span contenteditable spellcheck="false">${title}</span></p>
        </div>`;
        
        $('.calendars-wrap .calendars').append(html);

        // Select new calendar
        const $calendar = $('.calendars-wrap .calendar:last-child');
        this.selectCalendar($calendar);

        // Update linear view
        if (ui.viewIs('linear')) ui.linearView();

        // Save data
        this.data.push({
            id,
            title,
            events: []
        });
    },

    duplicateCalendar($calendar) {
        const $new = $calendar.clone();

        // Remove selected class and rename with 'copy'
        $new.removeClass('selected');
        $new.find('p span').append(' copy');

        // Reindex new calendar
        $new.attr('data-id', ++this.calendarID);

        // Clone calendar
        $calendar.after($new);

        // Unselect any selection
        window.getSelection().removeAllRanges();

        if (ui.viewIs('linear')) ui.linearView();
    },

    selectCalendar($calendar, selectedFirst, selectedLast) {
        // Store .selected-first and .selected-last dates if not passed
        if (!selectedFirst) selectedFirst = $('.selected-first').attr('data-date');
        if (!selectedLast) selectedLast = $('.selected-last').attr('data-date');

        // Update minicals UI
        $('.calendars-wrap .calendar.selected').removeClass('selected');
        $calendar.addClass('selected');

        if (ui.viewIs('linear')) {
            // Select calendar
            $('.calendar-wrap .calendar.selected').removeClass('selected');
            $(`.calendar-wrap .calendar[data-id="${$calendar.attr('data-id')}"]`).addClass('selected');
        } else {
            // Update ID
            $('.calendar-wrap .content').attr('data-id', $calendar.attr('data-id'));
        
            // Update title
            $('.calendar-wrap h2').html($calendar.find('p span').html());
        
            // Update main calendar
            $('.calendar-wrap .content').html($calendar.find('.content').html()).addClass('selected');
        }

        // Unselect any selection
        window.getSelection().removeAllRanges();
    
        selection.highlightSelection();

        // Restore .selected-first and .selected-last classes
        $('.selected-first, .selected-last').removeClass('selected-first selected-last');
        $(`.calendar-wrap .calendar.selected .day[data-date="${selectedFirst}"]`).addClass('selected-first');
        $(`.calendar-wrap .calendar.selected .day[data-date="${selectedLast}"]`).addClass('selected-last');

        this.updateCalendarHeight();
        stats.update();
    },

    renameCalendar(val, $calendar = null) {
        if ($calendar) {
            // Edited in sidebar, replace in main
            if ($calendar.hasClass('selected')) {
                $('.calendar-wrap h2').text(val);
            }
        } else {
            // Edited in main, replace in sidebar
            $('.calendars-wrap .calendar.selected p span').text(val);
        }
    },

    toggleCalendar($calendar) {
        $calendar.toggleClass('hidden');
        this.selectAnotherCalendar($calendar);
    },

    deleteCalendar($calendar) {
        this.selectAnotherCalendar($calendar);
        $calendar.remove();

        if (ui.viewIs('linear')) ui.linearView();

        // Update data
        const calendar = this.data.find(e => e.id === parseInt($calendar.attr('data-id')));
        this.data.splice(this.data.indexOf(calendar), 1);
        data.save();
    },

    selectPreviousCalendar() {
        // Find selected calendar
        let $calendar = $('.calendars-wrap .calendar.selected');

        // Unselect it
        $calendar.removeClass('selected');

        // Select previous visible calendar
        if ($calendar.prevAll('.calendar:not(.hidden)').length) $calendar = $calendar.prevAll('.calendar:not(.hidden)').eq(0)

        // Else, select last visible calendar
        else $calendar = $('.calendars-wrap .calendar:not(.hidden)').last();

        this.selectCalendar($calendar);
    },

    selectNextCalendar() {
        // Find selected calendar
        let $calendar = $('.calendars-wrap .calendar.selected');

        // Unselect it
        $calendar.removeClass('selected');

        // Select next visible calendar
        if ($calendar.nextAll('.calendar:not(.hidden)').length) $calendar = $calendar.nextAll('.calendar:not(.hidden)').eq(0);

        // Else, select first visible calendar
        else $calendar = $('.calendars-wrap .calendar:not(.hidden)').first();

        this.selectCalendar($calendar);
    },

    selectFirstCalendar() {
        const $calendar = $('.calendars-wrap .calendar').eq(0);
        this.selectCalendar($calendar);
    },

    selectAnotherCalendar($calendar) {
        // Select next (or previous) visible calendar
        if ($calendar.hasClass('selected')) {
            const $calendarToSelect = $calendar.nextAll(':not(.hidden)').eq(0).length ? $calendar.nextAll(':not(.hidden)').eq(0) : $calendar.prevAll(':not(.hidden)').length ? $calendar.prevAll(':not(.hidden)').eq(0) : null;
            if ($calendarToSelect) this.selectCalendar($calendarToSelect);
        }
    },

    updateCalendarHeight() {
        const mostEventsPerDay = Math.max(...$('.calendar-wrap .day .events').map((id, el) => $(el).find('.event').length));
        const height = `${Math.max(40 + mostEventsPerDay * 32, 72)}px`;
        $('.calendar-wrap .day').css('height', height);

        if (ui.viewIs('linear')) $('.calendars-wrap .calendar').css('height', height);
        else $('.calendars-wrap .calendar').css('height', '');
    }
}